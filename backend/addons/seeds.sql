-- Draft assortment only: confirm photos, prices, stock and supplier documents before publication.
-- @statement
INSERT INTO wink_addons(sku,slug,name,subtype,product_type,status,price_minor,public_data) VALUES
('SOFT-001','mini-bear-milk','MINI BEAR MILK','SOFT_TOY','ADDON','DRAFT',NULL,'{"short_name":"Молочный мишка","color":"milk","collections":["WINK SOFT 01"],"search_keywords":["мишка","медведь","bear"],"allow_as_addon":true,"allow_in_bundles":true}'),
('SOFT-002','mini-bunny-cream','MINI BUNNY CREAM','SOFT_TOY','ADDON','DRAFT',NULL,'{"short_name":"Кремовый зайчик","color":"cream","collections":["WINK SOFT 01","WELCOME BABY"],"search_keywords":["зайчик","заяц","bunny"],"allow_as_addon":true,"allow_in_bundles":true}'),
('SOFT-003','mini-bear-caramel','MINI BEAR CARAMEL','SOFT_TOY','ADDON','DRAFT',NULL,'{"short_name":"Карамельный мишка","color":"caramel","search_keywords":["мишка","медведь","bear"],"allow_as_addon":true,"allow_in_bundles":true}'),
('SOFT-004','cloud-bear','CLOUD BEAR','SOFT_TOY','ADDON','DRAFT',NULL,'{"short_name":"Облачный мишка","search_keywords":["мишка","медведь","bear"],"allow_as_addon":true,"allow_in_bundles":true}'),
('SOFT-005','big-hug-bear','BIG HUG BEAR','SOFT_TOY','ADDON','DRAFT',NULL,'{"short_name":"Большие объятия","delivery_class":"OVERSIZED","search_keywords":["большой","мишка","bear"],"allow_as_addon":true,"allow_in_bundles":true}'),
('SOFT-006','wink-handmade','WINK HANDMADE','HANDMADE','ADDON','DRAFT',NULL,'{"short_name":"Сделано для вас","is_wink_original":true,"non_returnable_to_stock":true,"allow_as_addon":true,"allow_in_bundles":true}'),
('CARD-001','personal-card','PERSONAL CARD','CARD','ADDON','DRAFT',30000,'{"short_name":"Персональная открытка","short_description":"Ваши слова — рядом с подарком.","allow_as_addon":true,"allow_in_bundles":true,"personalization_enabled":true,"personalization_fields":[{"key":"message","label":"Текст открытки","required":true,"max_length":300}],"search_keywords":["открытка","card"]}'),
('BND-001','soft-touch','SOFT TOUCH','','BUNDLE','DRAFT',NULL,'{}'),
('BND-002','keep-this-moment','KEEP THIS MOMENT','','BUNDLE','DRAFT',NULL,'{}'),
('BND-003','soft-bunny-baby','SOFT BUNNY BABY','','BUNDLE','DRAFT',NULL,'{}'),
('BND-004','big-hug','BIG HUG','','BUNDLE','DRAFT',NULL,'{}'),
('BND-005','personal-soft','PERSONAL SOFT','','BUNDLE','DRAFT',NULL,'{}') ON CONFLICT(sku) DO NOTHING;
-- @statement
INSERT INTO wink_addon_stock(addon_id) SELECT id FROM wink_addons ON CONFLICT DO NOTHING;
