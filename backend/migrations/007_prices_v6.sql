-- WINK_PRICE_v6_2026: Direct channel only. Never rewrite historical order items.
-- @statement
UPDATE products p SET base_price_minor=v.price,config=p.config||'{"price_version":"WINK_PRICE_V6"}'::jsonb,updated_at=now()
FROM (VALUES
('air16',450000),
('air30',750000),
('birthday16-1',590000),
('birthday16-2',720000),
('birthday30-1',890000),
('birthday30-2',990000),
('love16',520000),
('love30',890000),
('hearts7',320000),
('hearts14',590000),
('message16',650000),
('message30',950000),
('baby-reveal-solo',350000),
('baby-reveal16',750000)) AS v(slug,price) WHERE p.slug=v.slug;
-- @statement
UPDATE product_variants v SET price_delta_minor=0 FROM products p WHERE p.id=v.product_id AND p.config->>'price_version'='WINK_PRICE_V6';
-- @statement
UPDATE modifier_options SET price_delta_minor=CASE code WHEN 'BOWS_16' THEN 50000 WHEN 'BOWS_30' THEN 80000 END WHERE code IN ('BOWS_16','BOWS_30');
