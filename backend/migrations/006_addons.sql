-- Apply to a branch first. Additive extension of the inspected WINK schema.
-- @statement
CREATE TABLE wink_addons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sku text NOT NULL UNIQUE, slug text NOT NULL UNIQUE,
 name text NOT NULL, product_type text NOT NULL CHECK(product_type IN ('ADDON','SERVICE','BUNDLE')),
 subtype text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','HIDDEN','ARCHIVED')),
 price_minor integer CHECK(price_minor > 0), public_data jsonb NOT NULL DEFAULT '{}',
 revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(jsonb_typeof(public_data)='object'), CHECK(status <> 'ACTIVE' OR price_minor IS NOT NULL)
);
-- @statement
CREATE TABLE wink_addon_finance (
 addon_id uuid PRIMARY KEY REFERENCES wink_addons(id), cost_price_minor integer NOT NULL DEFAULT 0 CHECK(cost_price_minor>=0),
 variable_cost_minor integer NOT NULL DEFAULT 0 CHECK(variable_cost_minor>=0), recommended_price_minor integer,
 minimum_margin numeric NOT NULL DEFAULT 50 CHECK(minimum_margin BETWEEN 0 AND 100), supplier_data jsonb NOT NULL DEFAULT '{}'
);
-- @statement
CREATE TABLE wink_addon_cost_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, addon_id uuid NOT NULL REFERENCES wink_addons(id),
 cost_price_minor integer NOT NULL, variable_cost_minor integer NOT NULL, actor_id uuid NOT NULL REFERENCES staff_users(id), created_at timestamptz NOT NULL DEFAULT now()
);
-- @statement
CREATE TABLE wink_addon_stock (
 addon_id uuid PRIMARY KEY REFERENCES wink_addons(id), stock_quantity integer NOT NULL DEFAULT 0 CHECK(stock_quantity>=0),
 minimum_stock integer NOT NULL DEFAULT 0 CHECK(minimum_stock>=0), stock_type text NOT NULL DEFAULT 'TRACKED' CHECK(stock_type IN ('TRACKED','MADE_TO_ORDER'))
);
-- @statement
CREATE TABLE wink_bundle_components (
 bundle_id uuid NOT NULL REFERENCES wink_addons(id), product_id uuid NOT NULL REFERENCES wink_addons(id),
 quantity integer NOT NULL CHECK(quantity>0 AND quantity<=20), PRIMARY KEY(bundle_id,product_id), CHECK(bundle_id<>product_id)
);
-- @statement
CREATE TABLE wink_addon_recommendations (
 main_slug text PRIMARY KEY REFERENCES products(slug), addon_ids uuid[] NOT NULL DEFAULT '{}', revision integer NOT NULL DEFAULT 1
);
-- @statement
ALTER TABLE order_items ADD COLUMN addon_id uuid REFERENCES wink_addons(id),
 ADD COLUMN purchase_context text NOT NULL DEFAULT 'STANDALONE' CHECK(purchase_context IN ('STANDALONE','ADDON','BUNDLE')),
 ADD COLUMN main_sku_snapshot text, ADD COLUMN personalization_snapshot jsonb NOT NULL DEFAULT '{}',
 ADD COLUMN components_snapshot jsonb NOT NULL DEFAULT '[]', ADD COLUMN non_returnable_to_stock boolean NOT NULL DEFAULT false;
-- @statement
CREATE TABLE wink_order_addon_components (
 order_item_id uuid NOT NULL REFERENCES order_items(id), addon_id uuid NOT NULL REFERENCES wink_addons(id),
 quantity integer NOT NULL CHECK(quantity>0), returned_quantity integer NOT NULL DEFAULT 0 CHECK(returned_quantity>=0 AND returned_quantity<=quantity),
 PRIMARY KEY(order_item_id,addon_id)
);
-- @statement
CREATE TABLE wink_order_item_finance (
 order_item_id uuid PRIMARY KEY REFERENCES order_items(id), cost_snapshot_minor integer NOT NULL CHECK(cost_snapshot_minor>=0),
 variable_cost_snapshot_minor integer NOT NULL CHECK(variable_cost_snapshot_minor>=0)
);
-- @statement
CREATE TABLE wink_addon_reservations (
 order_id uuid NOT NULL REFERENCES orders(id), addon_id uuid NOT NULL REFERENCES wink_addons(id), quantity integer NOT NULL CHECK(quantity>0),
 state text NOT NULL CHECK(state IN ('HELD','CONSUMED','RELEASED')), expires_at timestamptz NOT NULL,
 PRIMARY KEY(order_id,addon_id)
);
-- @statement
CREATE INDEX wink_addon_reservations_active ON wink_addon_reservations(addon_id,expires_at) WHERE state='HELD';
-- @statement
CREATE TABLE wink_addon_refunds (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_item_id uuid NOT NULL REFERENCES order_items(id),
 provider_refund_id text NOT NULL UNIQUE, quantity integer NOT NULL CHECK(quantity>0), amount_minor integer NOT NULL CHECK(amount_minor>0),
 restock boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
-- @statement
CREATE TABLE wink_addon_events (
 event_id uuid PRIMARY KEY, event_name text NOT NULL CHECK(event_name IN ('addon_view','addon_click','addon_add','addon_remove','bundle_view','bundle_add','addon_purchase')),
 addon_id uuid REFERENCES wink_addons(id), main_slug text, purchase_context text CHECK(purchase_context IN ('STANDALONE','ADDON','BUNDLE')),
 order_item_id uuid REFERENCES order_items(id), created_at timestamptz NOT NULL DEFAULT now()
);
-- @statement
CREATE UNIQUE INDEX wink_addon_purchase_once ON wink_addon_events(order_item_id) WHERE event_name='addon_purchase';
-- @statement
CREATE TABLE wink_addon_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid NOT NULL REFERENCES staff_users(id),
 entity_id text NOT NULL, action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
-- @statement
CREATE VIEW wink_addon_availability AS
 SELECT s.addon_id,s.stock_type,s.stock_quantity,s.minimum_stock,
 COALESCE(r.quantity,0)::integer AS reserved_quantity,
 GREATEST(0,s.stock_quantity-COALESCE(r.quantity,0))::integer AS available_quantity
 FROM wink_addon_stock s LEFT JOIN (
 SELECT addon_id,SUM(quantity) AS quantity FROM wink_addon_reservations WHERE state='HELD' AND expires_at>now() GROUP BY addon_id
 ) r ON r.addon_id=s.addon_id;
-- @statement
CREATE FUNCTION wink_reserve_addons(p_order uuid) RETURNS timestamptz LANGUAGE plpgsql AS $$
DECLARE r record; held integer; expires timestamptz:=now()+interval '15 minutes'; existing timestamptz;
BEGIN
 PERFORM id FROM orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
 IF EXISTS(SELECT 1 FROM wink_addon_reservations WHERE order_id=p_order AND state='CONSUMED') THEN RAISE EXCEPTION 'order_already_consumed'; END IF;
 SELECT min(expires_at) INTO existing FROM wink_addon_reservations WHERE order_id=p_order AND state='HELD';
 IF existing>now() THEN RETURN existing; END IF;
 -- Every reservation/consumption/stock editor locks these same rows, in UUID order.
 PERFORM s.addon_id FROM wink_addon_stock s WHERE s.addon_id IN (
 SELECT c.addon_id FROM wink_order_addon_components c JOIN order_items i ON i.id=c.order_item_id WHERE i.order_id=p_order
 ) ORDER BY s.addon_id FOR UPDATE;
 FOR r IN SELECT c.addon_id,SUM(c.quantity)::integer AS quantity,s.stock_quantity,s.stock_type,a.status
 FROM wink_order_addon_components c JOIN order_items i ON i.id=c.order_item_id JOIN wink_addon_stock s ON s.addon_id=c.addon_id
 JOIN wink_addons a ON a.id=c.addon_id WHERE i.order_id=p_order GROUP BY c.addon_id,s.stock_quantity,s.stock_type,a.status ORDER BY c.addon_id LOOP
   IF r.status<>'ACTIVE' THEN RAISE EXCEPTION 'addon_unavailable:%',r.addon_id; END IF;
   IF r.stock_type='MADE_TO_ORDER' THEN CONTINUE; END IF;
   SELECT COALESCE(SUM(quantity),0) INTO held FROM wink_addon_reservations WHERE addon_id=r.addon_id AND state='HELD' AND expires_at>now() AND order_id<>p_order;
   IF r.stock_quantity-held<r.quantity THEN RAISE EXCEPTION 'addon_out_of_stock:%',r.addon_id; END IF;
   INSERT INTO wink_addon_reservations VALUES(p_order,r.addon_id,r.quantity,'HELD',expires)
   ON CONFLICT(order_id,addon_id) DO UPDATE SET quantity=excluded.quantity,state='HELD',expires_at=excluded.expires_at;
 END LOOP;
 RETURN expires;
END $$;
-- @statement
CREATE FUNCTION wink_consume_addons(p_order uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE held_row record;
BEGIN
 PERFORM id FROM orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
 IF EXISTS(SELECT 1 FROM wink_addon_reservations WHERE order_id=p_order AND state='CONSUMED') THEN RETURN; END IF;
 PERFORM s.addon_id FROM wink_addon_stock s JOIN wink_addon_reservations r ON r.addon_id=s.addon_id WHERE r.order_id=p_order ORDER BY s.addon_id FOR UPDATE OF s;
 IF EXISTS(SELECT 1 FROM wink_order_addon_components c JOIN order_items i ON i.id=c.order_item_id JOIN wink_addon_stock s ON s.addon_id=c.addon_id
 LEFT JOIN wink_addon_reservations r ON r.addon_id=c.addon_id AND r.order_id=p_order
 WHERE i.order_id=p_order AND s.stock_type='TRACKED' AND (r.order_id IS NULL OR r.state<>'HELD' OR r.expires_at<=clock_timestamp())) THEN RAISE EXCEPTION 'addon_reservation_expired'; END IF;
 FOR held_row IN SELECT * FROM wink_addon_reservations WHERE order_id=p_order ORDER BY addon_id LOOP
   UPDATE wink_addon_stock SET stock_quantity=stock_quantity-held_row.quantity WHERE addon_id=held_row.addon_id AND stock_quantity>=held_row.quantity;
   IF NOT FOUND THEN RAISE EXCEPTION 'addon_out_of_stock:%',held_row.addon_id; END IF;
 END LOOP;
 UPDATE wink_addon_reservations SET state='CONSUMED' WHERE order_id=p_order;
 INSERT INTO wink_addon_events(event_id,event_name,addon_id,main_slug,purchase_context,order_item_id)
 SELECT gen_random_uuid(),'addon_purchase',addon_id,main_sku_snapshot,purchase_context,id FROM order_items WHERE order_id=p_order AND addon_id IS NOT NULL ON CONFLICT DO NOTHING;
END $$;
-- @statement
CREATE FUNCTION wink_release_addons(p_order uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 PERFORM id FROM orders WHERE id=p_order FOR UPDATE;
 UPDATE wink_addon_reservations SET state='RELEASED' WHERE order_id=p_order AND state='HELD';
END $$;
-- @statement
REVOKE ALL ON wink_addons,wink_addon_finance,wink_addon_cost_history,wink_addon_stock,wink_bundle_components,wink_addon_recommendations,wink_order_addon_components,wink_order_item_finance,wink_addon_reservations,wink_addon_refunds,wink_addon_events,wink_addon_audit,wink_addon_availability FROM PUBLIC;
-- @statement
REVOKE ALL ON FUNCTION wink_reserve_addons(uuid),wink_consume_addons(uuid),wink_release_addons(uuid) FROM PUBLIC;

-- @statement
ALTER TABLE wink_addons ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_finance ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_cost_history ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_stock ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_bundle_components ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_recommendations ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_order_addon_components ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_order_item_finance ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_reservations ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_refunds ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_events ENABLE ROW LEVEL SECURITY;

-- @statement
ALTER TABLE wink_addon_audit ENABLE ROW LEVEL SECURITY;
