import { Link } from "react-router-dom";
import { AlarmClock, ArrowRight, Building2, Inbox, Plus, Trophy, Users, Workflow } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { getDashboard } from "./crmApi";
import { ContactActions, ErrorState, FollowUpBadge, formatDate, formatINR, PageHeader, STATUS_STYLES, StatusPill, useLoader } from "./ui";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ to, icon: Icon, label, value, detail, tone = "bg-ivory-200 text-ink-900" }) {
  return (
    <Link to={to} className="crm-card group flex flex-col gap-4 p-5 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(15,29,46,0.35)]">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-3xl font-bold tabular-nums text-ink-900">{value}</span>
        <span className="mt-1 block text-sm font-semibold text-ink-600">{label}</span>
        {detail && <span className="mt-0.5 block text-xs text-ink-400">{detail}</span>}
      </span>
    </Link>
  );
}

function BarList({ items, colorFor = () => "bg-terra-400", linkFor }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-400">No data yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const content = (
          <>
            <span className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-ink-800">{item.label}</span>
              <span className="tabular-nums text-ink-600">{item.count}</span>
            </span>
            <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-ivory-200">
              <span className={`block h-full rounded-full ${colorFor(item)}`} style={{ width: item.count ? `${Math.max(4, (item.count / max) * 100)}%` : 0 }} />
            </span>
          </>
        );
        return (
          <li key={item.label}>
            {linkFor ? (
              <Link to={linkFor(item)} className="block rounded-lg transition-opacity hover:opacity-80">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`crm-card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-ink-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const viewAll = (to, label = "View all") => (
  <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-terra-600 hover:text-terra-500">
    {label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
  </Link>
);

export default function Dashboard() {
  const { status, data, error, reload } = useLoader((signal) => getDashboard(signal), []);

  const header = (
    <PageHeader
      title={greeting()}
      description={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      actions={
        <Link to="/admin/enquiries/new" className="btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add enquiry
        </Link>
      }
    />
  );

  if (status === "loading") return <>{header}<PageLoader label="Loading dashboard" className="py-24" /></>;
  if (!data) return <>{header}<div className="crm-card mt-6"><ErrorState message={error} onRetry={reload} /></div></>;

  const dueCount = data.followUps.overdue + data.followUps.today;
  const pipeline = Object.entries(data.statusCounts).map(([label, count]) => ({ label, count }));

  return (
    <>
      {header}

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard to="/admin/enquiries?status=New" icon={Inbox} label="New enquiries" value={data.newCount} detail={`${data.newThisMonth} received this month`} tone="bg-sky-100 text-sky-800" />
        <StatCard
          to="/admin/enquiries?due=due&sort=followup"
          icon={AlarmClock}
          label="Follow-ups due"
          value={dueCount}
          detail={data.followUps.overdue ? `${data.followUps.overdue} overdue` : "Nothing overdue"}
          tone={data.followUps.overdue ? "bg-terra-500/12 text-terra-600" : "bg-amber-100 text-amber-800"}
        />
        <StatCard to="/admin/enquiries?status=open" icon={Workflow} label="Open pipeline" value={data.openCount} detail="New, contacted, quoted & follow-up" tone="bg-violet-100 text-violet-800" />
        <StatCard
          to="/admin/enquiries?status=Won"
          icon={Trophy}
          label="Won this month"
          value={data.wonThisMonth.count}
          detail={`${formatINR(data.wonThisMonth.value)}${data.conversionRate !== null ? ` · ${data.conversionRate}% win rate (90d)` : ""}`}
          tone="bg-emerald-100 text-emerald-800"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Follow-ups due" action={dueCount > 0 && viewAll("/admin/enquiries?due=due&sort=followup")} className="xl:col-span-2">
          {data.followUps.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">You're all caught up. No follow-ups due today.</p>
          ) : (
            <ul className="-mx-2 divide-y divide-ink-900/8">
              {data.followUps.items.map((enquiry) => (
                <li key={enquiry._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-2 py-3">
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/enquiries/${enquiry._id}`} className="font-semibold text-ink-900 hover:text-terra-600">
                      {enquiry.name}
                    </Link>
                    <p className="truncate text-xs text-ink-600">
                      #{enquiry.number} · {enquiry.destination || "Destination not set"} · <StatusLabel status={enquiry.status} />
                    </p>
                  </div>
                  <FollowUpBadge value={enquiry.followUpAt} />
                  <ContactActions phone={enquiry.phone} greeting={`Hi ${enquiry.name.split(" ")[0]}, this is GreatVoyagers following up on your ${enquiry.destination || "trip"} enquiry.`} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Pipeline" action={viewAll("/admin/enquiries")}>
          <BarList items={pipeline} colorFor={(item) => STATUS_STYLES[item.label]?.bar} linkFor={(item) => `/admin/enquiries?status=${encodeURIComponent(item.label)}`} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Enquiries by source" action={<span className="text-xs text-ink-400">Last 90 days</span>}>
          <BarList items={data.bySource} colorFor={() => "bg-sea-500"} linkFor={(item) => `/admin/enquiries?source=${encodeURIComponent(item.label)}`} />
        </Panel>
        <Panel title="Top destinations" action={<span className="text-xs text-ink-400">Last 90 days</span>}>
          <BarList items={data.byDestination} colorFor={() => "bg-terra-400"} linkFor={(item) => `/admin/enquiries?q=${encodeURIComponent(item.label)}`} />
        </Panel>
        <Panel title="Recent enquiries" action={viewAll("/admin/enquiries")} className="md:col-span-2 xl:col-span-1">
          {data.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No enquiries yet.</p>
          ) : (
            <ul className="-mx-2 divide-y divide-ink-900/8">
              {data.recent.map((enquiry) => (
                <li key={enquiry._id}>
                  <Link to={`/admin/enquiries/${enquiry._id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-ivory-100">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">{enquiry.name}</span>
                      <span className="block truncate text-xs text-ink-600">
                        {enquiry.destination || "—"} · {enquiry.source} · {formatDate(enquiry.createdAt)}
                      </span>
                    </span>
                    <StatusPill status={enquiry.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
        <Link to="/admin/customers" className="crm-card flex items-center gap-3 p-4 hover:border-ink-900/25">
          <Users className="h-5 w-5 text-ink-600" aria-hidden="true" />
          <span className="text-sm">
            <strong className="tabular-nums text-ink-900">{data.totals.customers.toLocaleString("en-IN")}</strong> <span className="text-ink-600">customers</span>
          </span>
        </Link>
        <Link to="/admin/vendors" className="crm-card flex items-center gap-3 p-4 hover:border-ink-900/25">
          <Building2 className="h-5 w-5 text-ink-600" aria-hidden="true" />
          <span className="text-sm">
            <strong className="tabular-nums text-ink-900">{data.totals.vendors.toLocaleString("en-IN")}</strong> <span className="text-ink-600">vendors</span>
          </span>
        </Link>
      </div>
    </>
  );
}

function StatusLabel({ status }) {
  return <span className="font-semibold">{status}</span>;
}
