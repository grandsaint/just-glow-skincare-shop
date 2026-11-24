DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
CREATE POLICY "Admins view settings" ON public.site_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Admins read product images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));