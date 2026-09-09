"use client";
import Image from "next/image";
import { useState } from "react";
import { FAMILY_NAMES, IMAGES, Product, productImage } from "@/lib/wink-shop";
import { FavoriteButton, ShopDialog } from "./WinkShopUI";

export default function WinkProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const frames = [
    {
      src: productImage(product),
      title: FAMILY_NAMES[product.name],
      label: "Композиция",
    },
    ...(product.name === "AIR"
      ? [
          { src: IMAGES.milk, title: "Молочная палитра", label: "Молочный" },
          {
            src: IMAGES.blackChrome,
            title: "Чёрный и серебро",
            label: "Контраст",
          },
        ]
      : []),
  ];
  const frame = frames[selected];
  return (
    <div className="wk-product-gallery">
      <figure>
        <button
          className="wk-gallery-open"
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Увеличить изображение: ${frame.title}`}
        >
          <Image
            src={frame.src}
            alt={`Визуализация: ${frame.title}`}
            width={1000}
            height={1250}
            priority
            unoptimized
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <span>Рассмотреть ↗</span>
        </button>
        <FavoriteButton slug={product.slug} />
      </figure>
      {frames.length > 1 && (
        <div
          className="wk-gallery-thumbs"
          role="group"
          aria-label="Изображения коллекции"
        >
          {frames.map((item, i) => (
            <button
              type="button"
              key={item.src}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <Image src={item.src} alt="" width={80} height={80} unoptimized />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      <p className="wk-image-note">
        {product.name === "HEARTS"
          ? "На изображении — 7 серебряных сердец. Для формата 14 сердец количество удваивается. Вся композиция — одного выбранного цвета. "
          : product.slug === "baby-reveal-solo"
            ? "SOLO — один чёрный шар-сюрприз, без боковых фонтанов. "
            : "Изображение показывает пример оформления коллекции. Точное количество шаров — в составе выбранного набора. "}
        Создано с ИИ. Изображение не меняется при выборе цвета или
        персонализации.
      </p>
      {zoom && (
        <ShopDialog
          open={zoom}
          onClose={() => setZoom(false)}
          title={frame.title}
        >
          <Image
            className="wk-gallery-zoom"
            src={frame.src}
            alt={`Визуализация: ${frame.title}`}
            width={1000}
            height={1250}
            unoptimized
          />
          <p className="wk-image-note">
            Идея оформления. Точный состав указан в карточке.
          </p>
        </ShopDialog>
      )}
    </div>
  );
}
