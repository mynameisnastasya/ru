-- Supplier logistics and safety files stay within the authenticated catalog API.
-- @statement
CREATE TABLE wink_addon_operations (
 addon_id uuid PRIMARY KEY REFERENCES wink_addons(id), data jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(data)='object')
);
-- @statement
ALTER TABLE wink_addon_operations ENABLE ROW LEVEL SECURITY;
-- @statement
REVOKE ALL ON wink_addon_operations FROM PUBLIC;
