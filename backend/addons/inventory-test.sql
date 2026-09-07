-- Run only on an isolated development branch. The inner block rolls all fixtures back.
DO $$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); o uuid:=gen_random_uuid(); o2 uuid:=gen_random_uuid(); i uuid:=gen_random_uuid(); i2 uuid:=gen_random_uuid(); expires timestamptz; n integer;
BEGIN
 BEGIN
  INSERT INTO wink_addons(id,sku,slug,name,product_type,status,price_minor) VALUES(a,'QA-'||a,'qa-'||a,'Test bear','ADDON','ACTIVE',100),(b,'QA-'||b,'qa-'||b,'Test card','ADDON','ACTIVE',100);
  INSERT INTO wink_addon_stock(addon_id,stock_quantity) VALUES(a,1),(b,40);
  INSERT INTO orders(id,number,customer_name,customer_phone,delivery_date) VALUES(o,'QA-'||left(o::text,8),'WINK automated test','+70000000000',current_date+10),(o2,'QA-'||left(o2::text,8),'WINK automated test','+70000000000',current_date+10);
  INSERT INTO order_items(id,order_id,addon_id,name_snapshot,quantity,unit_price_minor,line_total_minor,purchase_context) VALUES(i,o,a,'Historical bear',1,100,100,'BUNDLE'),(i2,o2,a,'Other bear',1,100,100,'ADDON');
  INSERT INTO wink_order_addon_components VALUES(i,a,1,0),(i,b,1,0),(i2,a,1,0);
  SELECT available_quantity INTO n FROM wink_addon_availability WHERE addon_id=a; IF n<>1 THEN RAISE EXCEPTION 'cart must not reserve'; END IF;
  SELECT wink_reserve_addons(o) INTO expires;
  IF wink_reserve_addons(o)<>expires THEN RAISE EXCEPTION 'retry extends reservation'; END IF;
  SELECT available_quantity INTO n FROM wink_addon_availability WHERE addon_id=a; IF n<>0 THEN RAISE EXCEPTION 'last item not held'; END IF;
  BEGIN PERFORM wink_reserve_addons(o2); RAISE EXCEPTION 'overselling permitted'; EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE 'addon_out_of_stock:%' THEN RAISE; END IF; END;
  PERFORM wink_consume_addons(o); PERFORM wink_consume_addons(o);
  SELECT stock_quantity INTO n FROM wink_addon_stock WHERE addon_id=a; IF n<>0 THEN RAISE EXCEPTION 'bear consumed twice'; END IF;
  SELECT stock_quantity INTO n FROM wink_addon_stock WHERE addon_id=b; IF n<>39 THEN RAISE EXCEPTION 'bundle card not consumed'; END IF;
  SELECT count(*) INTO n FROM wink_addon_events WHERE order_item_id=i AND event_name='addon_purchase'; IF n<>1 THEN RAISE EXCEPTION 'duplicate purchase event'; END IF;
  UPDATE wink_addons SET price_minor=99900,name='Changed bear',status='ARCHIVED' WHERE id=a;
  IF (SELECT name_snapshot FROM order_items WHERE id=i)<>'Historical bear' OR (SELECT unit_price_minor FROM order_items WHERE id=i)<>100 THEN RAISE EXCEPTION 'snapshot changed'; END IF;
  -- Roll back this entire fixture block, without touching existing orders.
  RAISE EXCEPTION USING ERRCODE='Z0001',MESSAGE='inventory_scenarios_passed';
 EXCEPTION WHEN SQLSTATE 'Z0001' THEN NULL;
 END;
END $$;
-- @statement
DO $$
DECLARE a uuid:=gen_random_uuid(); o uuid:=gen_random_uuid(); i uuid:=gen_random_uuid(); n integer;
BEGIN
 BEGIN
 INSERT INTO wink_addons(id,sku,slug,name,product_type,status,price_minor) VALUES(a,'QA-'||a,'qa-'||a,'Expiry test','ADDON','ACTIVE',100);
 INSERT INTO wink_addon_stock(addon_id,stock_quantity) VALUES(a,1);
 INSERT INTO orders(id,number,customer_name,customer_phone,delivery_date) VALUES(o,'QA-'||left(o::text,8),'WINK automated test','+70000000000',current_date+10);
 INSERT INTO order_items(id,order_id,addon_id,name_snapshot,quantity,unit_price_minor,line_total_minor) VALUES(i,o,a,'Expiry test',1,100,100);
 INSERT INTO wink_order_addon_components VALUES(i,a,1,0);
 PERFORM wink_reserve_addons(o);
 UPDATE wink_addon_reservations SET expires_at=now()-interval '1 second' WHERE order_id=o;
 SELECT available_quantity INTO n FROM wink_addon_availability WHERE addon_id=a; IF n<>1 THEN RAISE EXCEPTION 'expired hold blocks stock'; END IF;
 BEGIN PERFORM wink_consume_addons(o);RAISE EXCEPTION 'expired payment consumed';EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'addon_reservation_expired' THEN RAISE;END IF;END;
 PERFORM wink_reserve_addons(o);PERFORM wink_release_addons(o);PERFORM wink_release_addons(o);
 SELECT available_quantity INTO n FROM wink_addon_availability WHERE addon_id=a;IF n<>1 THEN RAISE EXCEPTION 'release failed';END IF;
 SELECT stock_quantity INTO n FROM wink_addon_stock WHERE addon_id=a;IF n<>1 THEN RAISE EXCEPTION 'release fabricated stock';END IF;
 RAISE EXCEPTION USING ERRCODE='Z0001',MESSAGE='expiry_scenarios_passed';
 EXCEPTION WHEN SQLSTATE 'Z0001' THEN NULL;
 END;
END $$;
