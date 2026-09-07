import type { Metadata } from "next";
import WinkEditorialPage2026 from "@/components/WinkEditorialPage2026";
import { CONTACT_URL, IMAGES } from "@/lib/wink-shop";
export const metadata: Metadata = {
  title: "Поздравления для компаний — WINK",
  description:
    "Композиции для сотрудников, клиентов и событий в Кемерово. Подбор по поводу, фирменным оттенкам и бюджету.",
};
export default function Page() {
  return (
    <WinkEditorialPage2026
      eyebrow="WINK · Для компаний"
      title="Деловой повод. Человеческий жест."
      intro="Поздравить сотрудника, поблагодарить клиента или отметить открытие. Подберём композиции под ваш повод, оттенки и бюджет."
      image={IMAGES.air}
      imageAlt="Визуализация воздушных композиций WINK"
      primary={{ href: CONTACT_URL, label: "Обсудить задачу" }}
      secondary={{ href: "/shop", label: "Готовые композиции" }}
      blocks={[
        {
          title: "Сотрудникам",
          text: "Дни рождения, новые должности и важные личные даты.",
        },
        {
          title: "Клиентам",
          text: "Поздравления и благодарность тем, с кем хочется продолжать работать.",
        },
        {
          title: "Для события",
          text: "Воздушные акценты для открытия, встречи или небольшого праздника.",
        },
      ]}
      note="Напишите дату, количество поздравлений и бюджет. Предложим состав, согласуем детали и полную стоимость."
    />
  );
}
