import {
  ArrowLeftRight,
  ArrowRight,
  Columns3,
  FilePlus2,
  Hand,
  History,
  Home,
  Link2,
  Lock,
  type LucideIcon,
  Smartphone,
  Undo2,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

const STEPS: Array<{ icon: LucideIcon; title: string; text: string; href: string; cta: string }> = [
  {
    icon: Users,
    title: "Müşteri ekle",
    text: "Firma adı ve yetkili bilgileriyle müşteriyi oluştur. Her içerik bir müşteriye bağlıdır.",
    href: "/clients?new=1",
    cta: "Müşteri ekle",
  },
  {
    icon: FilePlus2,
    title: "İçerik ekle",
    text: "Başlık, tür, müşteri ve teslim tarihini gir. Yeni içerik Taslak ya da Onayda olarak başlar.",
    href: "/contents?new=1",
    cta: "Yeni içerik",
  },
  {
    icon: Columns3,
    title: "Takip et",
    text: "Durumu panodan ilerlet; geciken ve yaklaşan teslimleri Özet ekranından izle.",
    href: "/contents",
    cta: "Panoya git",
  },
];

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line bg-surface px-1.5 font-sans text-xs font-bold text-ink-soft shadow-[0_1px_0_var(--color-line)]">
      {children}
    </kbd>
  );
}

function Tip({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-bold">{title}</p>
        <div className="mt-1 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </li>
  );
}

function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-bold text-ink hover:underline">
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

function StatusFlowDiagram() {
  return (
    <div className="rounded-card bg-canvas p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <StatusBadge status="draft" />
        <span className="flex items-center gap-1 text-xs font-semibold text-muted">
          <ArrowLeftRight className="size-4" aria-label="iki yönlü" />
        </span>
        <StatusBadge status="in_review" />
        <ArrowRight className="size-4 text-muted" aria-label="sonra" />
        <StatusBadge status="published" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-line pt-3">
        <StatusBadge status="published" />
        <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink-soft">
          <Undo2 className="size-4" />
          Yayından kaldır
        </span>
        <ArrowRight className="size-4 text-muted" aria-label="sonra" />
        <StatusBadge status="draft" />
      </div>
    </div>
  );
}

export function HelpView() {
  return (
    <>
      <div>
        <PageHeader eyebrow="Rehber" title="Nasıl kullanılır?" />
        <p className="mt-2 max-w-2xl text-[15px] text-muted">
          antflow, müşterilerinin içeriklerini taslaktan yayına kadar tek yerden takip etmen için tasarlandı. Temel akış üç
          adım.
        </p>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-col rounded-panel border border-line-soft bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-sunken text-ink-soft">
                <step.icon className="size-5" />
              </span>
              <span className="text-3xl font-extrabold tracking-tighter text-line">{index + 1}</span>
            </div>
            <h2 className="mt-4 text-base font-extrabold">{step.title}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{step.text}</p>
            <div className="mt-4">
              <MoreLink href={step.href}>{step.cta}</MoreLink>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Durum akışı" />
          <StatusFlowDiagram />
          <ul className="mt-5 flex flex-col gap-4">
            <Tip icon={ArrowRight} title="Adım adım ilerler">
              Taslak içerik onaya gönderilir. Onaydaki içerik yayınlanır ya da düzeltme için taslağa geri gönderilir.
              Taslaktan doğrudan yayına geçilmez.
            </Tip>
            <Tip icon={Lock} title="Yayındaki içerik kilitlidir">
              Yayındaki içerik salt okunur açılır. Değiştirmek için önce yayından kaldır; içerik taslağa döner.
            </Tip>
            <Tip icon={History} title="Her değişiklik kaydedilir">
              Durum değişiklikleri, yapan kişi ve zamanıyla birlikte içeriğin geçmişine yazılır.
            </Tip>
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Pano ve liste" />
          <ul className="flex flex-col gap-4">
            <Tip icon={Hand} title="Sürükle ve bırak">
              Kartı tutup başka bir sütuna bırakarak durumunu değiştir. Sürüklerken yalnızca izin verilen sütunlar
              vurgulanır.
            </Tip>
            <Tip icon={Columns3} title="Klavyeyle taşı">
              <span className="flex flex-wrap items-center gap-1.5">
                Kartın tutamacına gel, <Kbd>Boşluk</Kbd> ile al, <Kbd>←</Kbd> <Kbd>→</Kbd> ile sütun değiştir,{" "}
                <Kbd>Boşluk</Kbd> ile bırak, <Kbd>Esc</Kbd> ile vazgeç.
              </span>
            </Tip>
            <Tip icon={Link2} title="Filtreler paylaşılabilir">
              Arama, müşteri, tür ve durum filtreleri adres çubuğunda tutulur. Bağlantıyı paylaşan kişi aynı görünümü
              görür.
            </Tip>
            <Tip icon={Smartphone} title="Mobilde">
              Sütunlar sekmelere dönüşür; durumu kartın menüsünden değiştirebilirsin.
            </Tip>
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <PanelHeader title="Özet" action={<MoreLink href="/">Özete git</MoreLink>} />
          <ul className="flex flex-col gap-4">
            <Tip icon={Home} title="Günün resmi">
              Duruma göre içerik sayıları, müşteri dağılımı ve geciken ya da önümüzdeki iki gün içinde teslim edilecek
              içerikler tek ekranda.
            </Tip>
          </ul>
        </Panel>
        <Panel>
          <PanelHeader title="Hareketler" action={<MoreLink href="/activity">Hareketlere git</MoreLink>} />
          <ul className="flex flex-col gap-4">
            <Tip icon={History} title="Tüm geçmiş">
              Bütün durum değişiklikleri gün gün listelenir. İçerik başlığıyla ara, müşteriye ya da yeni duruma göre
              filtrele. Tek bir içeriğin geçmişi düzenleme panelinin altında da görünür.
            </Tip>
          </ul>
        </Panel>
      </div>
    </>
  );
}
