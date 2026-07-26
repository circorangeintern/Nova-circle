import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { CATEGORY_MAP } from "@/lib/constants";
import { statusMarker } from "./markerIcon";
import { cn } from "@/lib/cn";

// Nigeria-centred default view
const NIGERIA_CENTER = [9.082, 8.6753];
const NIGERIA_BOUNDS = [
  [4.2, 2.7],
  [13.9, 14.7],
];

/**
 * ReportMap — reusable Leaflet map rendering status-coloured report pins with
 * preview popups. Used by the landing preview and the full /map page.
 * (PRD §5.3 / Master PRD §3.3.)
 */
export function ReportMap({
  reports = [],
  center = NIGERIA_CENTER,
  zoom = 6.4,
  className,
  scrollWheelZoom = false,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      className={cn("size-full", className)}
      zoomControl
      minZoom={6.2}
      maxZoom={10}
      maxBounds={NIGERIA_BOUNDS}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {reports.map((report) => {
        const category = CATEGORY_MAP[report.category];
        const pulse =
          report.severity === "critical" || report.status === "open";
        return (
          <Marker
            key={report.id}
            position={[report.coordinates.lat, report.coordinates.lng]}
            icon={statusMarker(report.status, { pulse })}
          >
            <Popup>
              <div className="overflow-hidden rounded-[14px]">
                <img
                  src={report.photo}
                  alt={report.title}
                  className="h-28 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={report.status} size="sm" />
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <h4 className="mt-2 line-clamp-2 font-sans text-sm font-semibold text-ink">
                    {report.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    {category?.label} · {report.lga}, {report.state}
                  </p>
                  <Link
                    to={`/reports/${report.id}`}
                    className="mt-2 inline-block text-sm font-semibold text-civic-600 hover:underline"
                  >
                    View full report →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
