import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  X,
  Search,
  Calendar,
  RefreshCw,
  PlusSquare,
  Edit,
  Check,
  Printer,
  ChevronDown,
  ArrowRightLeft,
  Grip,
  SlidersHorizontal,
  Plus,
  Clock,
  Truck,
  CheckCircle,
  Eye,
  Download,
  Warehouse,
  Building2,
  Trash2,
  Package,
  MapPin,
  Hash,
  FileText,
  ChevronRight,
} from "lucide-react";

/* ─────────────── Inline SVGs ─────────────── */
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

/* ─────────────── 3D Action Button ─────────────── */
const ActionButton3D = ({ onClick, icon: Icon, label, color }) => {
  const [pressed, setPressed] = useState(false);

  const colorMap = {
    blue:   { bg: "#dbeafe", fg: "#1d4ed8", shadow: "#93c5fd", hover: "#bfdbfe" },
    green:  { bg: "#dcfce7", fg: "#15803d", shadow: "#86efac", hover: "#bbf7d0" },
    purple: { bg: "#ede9fe", fg: "#7c3aed", shadow: "#c4b5fd", hover: "#ddd6fe" },
    rose:   { bg: "#ffe4e6", fg: "#be123c", shadow: "#fda4af", hover: "#fecdd3" },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "none",
        background: c.bg,
        color: c.fg,
        cursor: "pointer",
        boxShadow: pressed
          ? `0 1px 0 ${c.shadow}, inset 0 2px 4px rgba(0,0,0,0.08)`
          : `0 4px 0 ${c.shadow}, 0 6px 12px rgba(0,0,0,0.07)`,
        transform: pressed ? "translateY(3px)" : "translateY(0px)",
        transition: "all 0.12s cubic-bezier(.34,1.56,.64,1)",
        position: "relative",
      }}
      onMouseEnter={(e) => { if (!pressed) e.currentTarget.style.background = c.hover; }}
      onFocus={(e) => {}}
    >
      <Icon size={15} strokeWidth={2.2} />
    </button>
  );
};

/* ─────────────── View Transfer Modal ─────────────── */
function ViewTransferModal({ transfer, warehouseMap, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Stock Transfer - ${transfer.invoiceNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
        h1 { font-size: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f3f4f6; font-weight: 700; }
        .badge { display:inline-block; padding: 3px 10px; border-radius: 99px; font-size:12px; font-weight:700; background:#dcfce7; color:#15803d; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .field label { font-size:10px; font-weight:700; text-transform:uppercase; color:#6b7280; letter-spacing:.05em; }
        .field p { font-size:14px; font-weight:600; color:#111; margin:2px 0 0; }
        @media print { body { padding: 0; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
    const rows = transfer.items?.map(
      (it) => `${it.product?.name || "—"},${it.quantity},${it.price || 0},${it.amount || 0}`
    ).join("\n") || "";
    const csv = [
      `Transfer ID,${transfer.invoiceNo}`,
      `Date,${new Date(transfer.date).toLocaleDateString("en-GB")}`,
      `Source,${warehouseMap[transfer.warehouseId] || "—"}`,
      `Destination,${warehouseMap[transfer.toWarehouseId] || "—"}`,
      `Status,${transfer.status}`,
      "",
      "Product,Qty,Price,Amount",
      rows,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${transfer.invoiceNo}.csv`;
    a.click();
  };

  const statusColor =
    transfer.status === "PAID" || transfer.status === "COMPLETED"
      ? { bg: "#dcfce7", fg: "#15803d", label: "Completed" }
      : { bg: "#fef3c7", fg: "#b45309", label: "Pending" };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity:0; transform: translateY(30px) scale(0.97); }
            to   { opacity:1; transform: translateY(0)    scale(1); }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)",
          padding: "20px 24px 24px",
          position: "relative",
        }}>
          {/* 3D floating circles decoration */}
          <div style={{ position:"absolute",top:12,right:60,width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,0.07)" }} />
          <div style={{ position:"absolute",bottom:-20,left:40,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }} />

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <div style={{
                  background:"rgba(255,255,255,0.18)",
                  borderRadius:10,
                  padding:"7px 10px",
                  backdropFilter:"blur(4px)",
                }}>
                  <ArrowRightLeft size={18} color="#fff" />
                </div>
                <span style={{ color:"rgba(255,255,255,0.7)", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  Stock Transfer Details
                </span>
              </div>
              <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:0 }}>{transfer.invoiceNo}</h2>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, margin:"4px 0 0" }}>
                {new Date(transfer.date).toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={handleDownload}
                style={{
                  background:"rgba(255,255,255,0.18)", border:"none", borderRadius:10,
                  width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", cursor:"pointer", backdropFilter:"blur(4px)",
                  boxShadow:"0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)",
                  transition:"all 0.15s",
                }}
                title="Download CSV"
                onMouseDown={e => { e.currentTarget.style.transform="translateY(3px)"; e.currentTarget.style.boxShadow="0 1px 0 rgba(0,0,0,0.15)"; }}
                onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)"; }}
              >
                <Download size={16} />
              </button>
              <button
                onClick={handlePrint}
                style={{
                  background:"rgba(255,255,255,0.18)", border:"none", borderRadius:10,
                  width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", cursor:"pointer", backdropFilter:"blur(4px)",
                  boxShadow:"0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)",
                  transition:"all 0.15s",
                }}
                title="Print"
                onMouseDown={e => { e.currentTarget.style.transform="translateY(3px)"; e.currentTarget.style.boxShadow="0 1px 0 rgba(0,0,0,0.15)"; }}
                onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)"; }}
              >
                <Printer size={16} />
              </button>
              <button
                onClick={onClose}
                style={{
                  background:"rgba(255,255,255,0.18)", border:"none", borderRadius:10,
                  width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", cursor:"pointer", backdropFilter:"blur(4px)",
                  boxShadow:"0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)",
                  transition:"all 0.15s",
                }}
                title="Close"
                onMouseDown={e => { e.currentTarget.style.transform="translateY(3px)"; e.currentTarget.style.boxShadow="0 1px 0 rgba(0,0,0,0.15)"; }}
                onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)"; }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div ref={printRef} style={{ overflowY:"auto", flex:1, padding:"24px" }}>

          {/* Route Card */}
          <div style={{
            background:"linear-gradient(135deg,#eff6ff,#f5f3ff)",
            border:"1px solid #e0e7ff",
            borderRadius:14,
            padding:"16px 20px",
            display:"flex",
            alignItems:"center",
            gap:16,
            marginBottom:20,
          }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Source</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#1e3a8a", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                <Warehouse size={14} color="#3b82f6" />
                {warehouseMap[transfer.warehouseId] || `#${transfer.warehouseId}`}
              </div>
            </div>
            <div style={{
              width:40, height:40, borderRadius:"50%",
              background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 0 rgba(59,130,246,0.3), 0 8px 16px rgba(59,130,246,0.2)",
              flexShrink:0,
            }}>
              <ArrowRightLeft size={18} color="#fff" />
            </div>
            <div style={{ flex:1, textAlign:"right" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Destination</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#4c1d95", marginTop:3, display:"flex", alignItems:"center", justifyContent:"flex-end", gap:6 }}>
                <Building2 size={14} color="#8b5cf6" />
                {warehouseMap[transfer.toWarehouseId] || `#${transfer.toWarehouseId}`}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
            {[
              { label:"Transfer ID", value: transfer.invoiceNo, icon: Hash, color:"#3b82f6" },
              { label:"Date", value: new Date(transfer.date).toLocaleDateString("en-GB"), icon: Calendar, color:"#f59e0b" },
              { label:"Status", value: statusColor.label, icon: CheckCircle, color: statusColor.fg, badge: statusColor },
            ].map((info, i) => (
              <div key={i} style={{
                background:"#f9fafb", borderRadius:12, padding:"12px 14px",
                border:"1px solid #f3f4f6",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  <info.icon size={12} color={info.color} />
                  <span style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em" }}>{info.label}</span>
                </div>
                {info.badge ? (
                  <span style={{
                    display:"inline-block", padding:"2px 10px", borderRadius:99,
                    fontSize:12, fontWeight:700,
                    background: info.badge.bg, color: info.badge.fg,
                  }}>{info.value}</span>
                ) : (
                  <div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{info.value}</div>
                )}
              </div>
            ))}
          </div>

          {/* Remark */}
          {transfer.remark && (
            <div style={{
              background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10,
              padding:"10px 14px", marginBottom:20,
              display:"flex", gap:8, alignItems:"flex-start",
            }}>
              <FileText size={14} color="#f59e0b" style={{ marginTop:2, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#b45309", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Remark</div>
                <div style={{ fontSize:13, color:"#78350f" }}>{transfer.remark}</div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden" }}>
            <div style={{
              display:"grid", gridTemplateColumns:"1fr 80px 90px 90px",
              padding:"10px 16px", background:"#f9fafb",
              borderBottom:"1px solid #e5e7eb",
            }}>
              {["Product", "Qty", "Price", "Amount"].map((h) => (
                <span key={h} style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em", textAlign: h !== "Product" ? "center" : "left" }}>{h}</span>
              ))}
            </div>
            {transfer.items?.length > 0 ? (
              transfer.items.map((item, i) => (
                <div key={i} style={{
                  display:"grid", gridTemplateColumns:"1fr 80px 90px 90px",
                  padding:"12px 16px",
                  borderBottom: i < transfer.items.length - 1 ? "1px solid #f3f4f6" : "none",
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#111" }}>
                      {item.product?.name || `Product #${item.productId}`}
                    </div>
                    {item.product?.sku && (
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>SKU: {item.product.sku}</div>
                    )}
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1d4ed8", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {item.quantity}
                  </div>
                  <div style={{ fontSize:13, color:"#374151", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    ₹{(item.price || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#059669", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    ₹{(item.amount || 0).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding:"24px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>No items found</div>
            )}
            {/* Totals Row */}
            <div style={{
              display:"grid", gridTemplateColumns:"1fr 80px 90px 90px",
              padding:"12px 16px",
              background:"linear-gradient(135deg,#eff6ff,#f5f3ff)",
              borderTop:"2px solid #e0e7ff",
            }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#374151" }}>
                Total: {transfer.items?.length || 0} products · {transfer.items?.reduce((a,i) => a + i.quantity, 0) || 0} units
              </div>
              <div style={{ textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{
                  background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  color:"#fff", borderRadius:99, padding:"2px 10px",
                  fontSize:12, fontWeight:700,
                }}>
                  {transfer.items?.reduce((a, i) => a + i.quantity, 0) || 0}
                </span>
              </div>
              <div />
              <div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ₹{(transfer.totalAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Main Export ─────────────── */
export function GodownTransfer() {
  const [isCreating, setIsCreating] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [viewTransfer, setViewTransfer] = useState(null);

  useEffect(() => {
    fetchWarehouses();
    fetchTransfers();
  }, []);

  useEffect(() => {
    if (!isCreating) fetchTransfers();
  }, [isCreating]);

  const fetchWarehouses = () => {
    apiClient.get('/warehouses').then((res) => {
      if (res.data?.data) setWarehouses(res.data.data);
    }).catch(console.error);
  };

  const fetchTransfers = () => {
    apiClient.get("/inventory/STOCK_TRANSFER")
      .then((res) => {
        if (res.data?.data) setTransfers(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  // Build warehouse map
  const warehouseMap = {};
  warehouses.forEach((w) => { warehouseMap[w.id] = w.name; });

  return (
    <>
      <GodownTransferList
        transfers={transfers}
        warehouses={warehouses}
        warehouseMap={warehouseMap}
        onCreate={() => setIsCreating(true)}
        onView={(t) => setViewTransfer(t)}
      />

      {/* Create Transfer Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <GodownTransferForm
            onCancel={() => setIsCreating(false)}
            onSave={() => {
              fetchTransfers();
              setIsCreating(false);
            }}
          />
        </div>
      )}

      {/* View Transfer Modal */}
      {viewTransfer && (
        <ViewTransferModal
          transfer={viewTransfer}
          warehouseMap={warehouseMap}
          onClose={() => setViewTransfer(null)}
        />
      )}
    </>
  );
}

/* ─────────────── List Component ─────────────── */
function GodownTransferList({ transfers, warehouses, warehouseMap, onCreate, onView }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const total     = transfers.length;
  const completed = transfers.filter((t) => t.status === "PAID" || t.status === "COMPLETED").length;
  const pending   = total - completed;
  const inTransit = 0;

  const filtered = transfers.filter((t) => {
    if (search && !t.invoiceNo?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Completed" && t.status !== "PAID" && t.status !== "COMPLETED") return false;
    if (filter === "Pending"   && (t.status === "PAID" || t.status === "COMPLETED")) return false;
    return true;
  });

  const handleDownloadSingle = (t) => {
    const rows = t.items?.map(
      (it) => `${it.product?.name || "—"},${it.quantity},${it.price || 0},${it.amount || 0}`
    ).join("\n") || "";
    const csv = [
      `Transfer ID,${t.invoiceNo}`,
      `Date,${new Date(t.date).toLocaleDateString("en-GB")}`,
      `Source,${warehouseMap[t.warehouseId] || "—"}`,
      `Destination,${warehouseMap[t.toWarehouseId] || "—"}`,
      `Status,${t.status}`,
      "",
      "Product,Qty,Price,Amount",
      rows,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${t.invoiceNo}.csv`;
    a.click();
  };

  const handlePrintSingle = (t) => {
    const itemsHtml = (t.items || []).map(
      (it, i) => `<tr style="background:${i%2===0?"#fff":"#f9fafb"}">
        <td>${it.product?.name || `Product #${it.productId}`}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:center">₹${it.price || 0}</td>
        <td style="text-align:center">₹${it.amount || 0}</td>
      </tr>`
    ).join("");

    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Stock Transfer - ${t.invoiceNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
        h1 { font-size:22px; margin:0; } .subtitle{color:#6b7280;font-size:13px;margin-top:4px;}
        .header-bar { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #e5e7eb; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:24px; }
        .info-box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
        .info-box label { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:4px; }
        .info-box p { font-size:14px; font-weight:700; margin:0; }
        table { width:100%; border-collapse:collapse; }
        th,td { border:1px solid #e5e7eb; padding:10px 14px; text-align:left; font-size:13px; }
        th { background:#f3f4f6; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }
        .route { display:flex; align-items:center; gap:16px; background:#eff6ff; border:1px solid #dbeafe; border-radius:10px; padding:14px 18px; margin-bottom:20px; }
        .route-label { font-size:10px; font-weight:700; color:#6b7280; text-transform:uppercase; }
        .route-val { font-size:15px; font-weight:700; color:#1d4ed8; margin-top:2px; }
        .arrow { font-size:20px; color:#3b82f6; }
      </style></head><body>
      <div class="header-bar">
        <div><h1>Stock Transfer</h1><p class="subtitle">Transfer Record · ${new Date().toLocaleDateString("en-GB")}</p></div>
        <div style="text-align:right"><p style="font-size:20px;font-weight:800;color:#1d4ed8;margin:0">${t.invoiceNo}</p></div>
      </div>
      <div class="route">
        <div><div class="route-label">Source</div><div class="route-val">${warehouseMap[t.warehouseId] || "—"}</div></div>
        <div class="arrow">→</div>
        <div><div class="route-label">Destination</div><div class="route-val">${warehouseMap[t.toWarehouseId] || "—"}</div></div>
      </div>
      <div class="info-grid">
        <div class="info-box"><label>Date</label><p>${new Date(t.date).toLocaleDateString("en-GB")}</p></div>
        <div class="info-box"><label>Items</label><p>${t.items?.length || 0} Products</p></div>
        <div class="info-box"><label>Status</label><p>${t.status}</p></div>
      </div>
      ${t.remark ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;margin-bottom:20px;"><b>Remark:</b> ${t.remark}</div>` : ""}
      <table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:center">Price</th><th style="text-align:center">Amount</th></tr></thead>
      <tbody>${itemsHtml}</tbody></table>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-45px)] p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Transfer</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track inventory movement across stores</p>
          </div>
          <button
            onClick={onCreate}
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#7c3aed)",
              boxShadow: "0 4px 0 #1e3a8a, 0 8px 20px rgba(29,78,216,0.3)",
              transform: "translateY(0)",
              transition: "all 0.15s",
            }}
            onMouseDown={e => { e.currentTarget.style.transform="translateY(4px)"; e.currentTarget.style.boxShadow="0 0 0 #1e3a8a, 0 4px 10px rgba(29,78,216,0.2)"; }}
            onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 0 #1e3a8a, 0 8px 20px rgba(29,78,216,0.3)"; }}
            className="text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Create Transfer
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: ArrowRightLeft, label: "Total Transfers", value: total,     bg:"#dbeafe", fg:"#1d4ed8", shadow:"#93c5fd" },
            { icon: Clock,          label: "Pending",         value: pending,   bg:"#ffedd5", fg:"#c2410c", shadow:"#fdba74" },
            { icon: Truck,          label: "In Transit",      value: inTransit, bg:"#e0f2fe", fg:"#0369a1", shadow:"#7dd3fc" },
            { icon: CheckCircle,    label: "Completed",       value: completed, bg:"#dcfce7", fg:"#15803d", shadow:"#86efac" },
          ].map((card, i) => (
            <div key={i} style={{
              background:"#fff",
              borderRadius:16,
              border:"1px solid #f3f4f6",
              padding:"16px 20px",
              display:"flex",
              alignItems:"center",
              gap:14,
              boxShadow:`0 4px 0 ${card.shadow}33, 0 8px 24px rgba(0,0,0,0.06)`,
              transition:"transform 0.2s, box-shadow 0.2s",
              cursor:"default",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 0 ${card.shadow}44, 0 12px 30px rgba(0,0,0,0.09)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 0 ${card.shadow}33, 0 8px 24px rgba(0,0,0,0.06)`; }}
            >
              <div style={{
                background:card.bg, borderRadius:12, padding:12,
                boxShadow:`0 3px 0 ${card.shadow}66`,
              }}>
                <card.icon size={22} color={card.fg} />
              </div>
              <div>
                <div style={{ fontSize:26, fontWeight:800, color:"#111", lineHeight:1 }}>{card.value}</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.07em", marginTop:3 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Transfer ID..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 bg-gray-50 p-1 rounded-lg">
              {["All", "Pending", "In Transit", "Completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Transfer ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source Store</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-sm">
                      {transfers.length === 0
                        ? 'No transfers found. Click "+ Create Transfer" to get started.'
                        : "No results match your search/filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const isCompleted = t.status === "PAID" || t.status === "COMPLETED";
                    return (
                      <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{t.invoiceNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                              <Warehouse className="w-3.5 h-3.5" />
                            </div>
                            {warehouseMap[t.warehouseId] || (t.warehouseId ? `Warehouse #${t.warehouseId}` : "—")}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            {warehouseMap[t.toWarehouseId] || (t.toWarehouseId ? `Warehouse #${t.toWarehouseId}` : "—")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{t.items?.length || 0} Items</div>
                          <div className="text-xs text-gray-500">
                            {t.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0} Units
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{new Date(t.date).toLocaleDateString("en-GB")}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span style={{
                            display:"inline-flex", alignItems:"center",
                            padding:"3px 12px", borderRadius:99,
                            fontSize:12, fontWeight:700,
                            background: isCompleted ? "#dcfce7" : "#fef3c7",
                            color:       isCompleted ? "#15803d" : "#b45309",
                            boxShadow:   isCompleted ? "0 2px 0 #86efac66" : "0 2px 0 #fde68a66",
                          }}>
                            {isCompleted ? "Completed" : "Pending"}
                          </span>
                        </td>

                        {/* ── Action Buttons ── */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <ActionButton3D
                              icon={Eye}
                              label="View Details"
                              color="blue"
                              onClick={() => onView(t)}
                            />
                            <ActionButton3D
                              icon={Download}
                              label="Download CSV"
                              color="green"
                              onClick={() => handleDownloadSingle(t)}
                            />
                            <ActionButton3D
                              icon={Printer}
                              label="Print"
                              color="purple"
                              onClick={() => handlePrintSingle(t)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Create Form ─────────────── */
function GodownTransferForm({ onCancel, onSave }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate]                 = useState(today);
  const [items, setItems]               = useState([]);
  const [productName, setProductName]   = useState("");
  const [transferQty, setTransferQty]   = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destWarehouse, setDestWarehouse]     = useState("");
  const [transferNo, setTransferNo]     = useState("TRN-0001");
  const [vehicleNo, setVehicleNo]       = useState("");
  const [remark, setRemark]             = useState("");
  const [warehouses, setWarehouses]     = useState([]);
  const [products, setProducts]         = useState([]);

  useEffect(() => {
    apiClient.get("/warehouses").then((res) => { if (res.data.data) setWarehouses(res.data.data); });
  }, []);

  useEffect(() => {
    const url = sourceWarehouse ? `/products?limit=100&warehouseId=${sourceWarehouse}` : "/products?limit=100";
    apiClient.get(url).then((res) => { if (res.data.data) setProducts(res.data.data); });
  }, [sourceWarehouse]);

  const handleAddItem = () => {
    if (productName && transferQty) {
      const selectedProduct = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
      const stock = selectedProduct ? selectedProduct.stock : 0;
      setItems([...items, {
        id: Date.now(), name: productName, stock, qty: transferQty,
        unit: selectedProduct?.baseUnit || "PCS",
      }]);
      setProductName("");
      setTransferQty("");
    }
  };

  const handleRemoveItem = (id) => setItems(items.filter((item) => item.id !== id));

  const handleSubmit = async () => {
    if (!sourceWarehouse || !destWarehouse) {
      alert("Please select both source and destination warehouses.");
      return;
    }
    if (sourceWarehouse === destWarehouse) {
      alert("Source and destination warehouses cannot be the same.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item to transfer.");
      return;
    }

    const payload = {
      invoiceNo: transferNo,
      date,
      warehouseId: sourceWarehouse,
      toWarehouseId: destWarehouse,
      remark: remark ? `${remark} (Vehicle: ${vehicleNo})` : `Vehicle: ${vehicleNo}`,
      status: "PAID",
      items: items.map((item) => ({
        productId: products.find((p) => p.name.toLowerCase() === item.name.toLowerCase())?.id,
        quantity: parseInt(item.qty, 10),
        price: 0,
        amount: 0,
      })),
    };

    try {
      const res = await apiClient.post("/inventory/STOCK_TRANSFER", payload);
      if (res.data) {
        alert("Stock transfer saved successfully.");
        onSave();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save stock transfer.");
    }
  };

  const canSubmit = items.length > 0 && sourceWarehouse && destWarehouse;

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">Create New Stock Transfer</h2>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Multi-Store Inventory Logistics</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* LEFT PANEL */}
        <div className="w-[340px] flex-shrink-0 p-5 flex flex-col gap-5 overflow-y-auto border-r border-gray-100">
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logistics Configuration</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source Store</label>
              <select value={sourceWarehouse} onChange={(e) => setSourceWarehouse(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none">
                <option value="">Select Source Store...</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-200 bg-white flex items-center justify-center text-blue-500 shadow-sm">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Destination Store</label>
              <select value={destWarehouse} onChange={(e) => setDestWarehouse(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-gray-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10">
                <option value="">Select Destination...</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transfer Date</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 text-[14px] font-semibold text-gray-800 outline-none bg-transparent" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transfer Notes</label>
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
              placeholder="Add any instructions or reasons for transfer..."
              rows={4}
              className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none placeholder-gray-400" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Product Selection</span>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text" value={productName}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="flex-1 text-[13px] text-gray-700 outline-none placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-[1fr_90px_140px] px-5 py-2 border-b border-t border-gray-100 bg-white">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Product Details</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Available</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Quantity</span>
            </div>

            {(searchFocused || productName) && (
              products
                .filter(p => !productName || p.name.toLowerCase().includes(productName.toLowerCase()) || p.sku?.toLowerCase().includes(productName.toLowerCase()))
                .slice(0, productName ? 20 : 8)
                .map(p => (
                  <div 
                    key={p.id} 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const alreadyAdded = items.find(i => i.name.toLowerCase() === p.name.toLowerCase());
                      if (alreadyAdded) {
                        setItems(prev => prev.map(i => i.name.toLowerCase() === p.name.toLowerCase() ? { ...i, qty: String(parseInt(i.qty || 0) + 1) } : i));
                      } else {
                        setItems(prev => [...prev, { id: Date.now(), name: p.name, stock: p.stock, qty: '1', unit: p.baseUnit || 'PCS', sku: p.sku, sale: p.sale || p.price }]);
                      }
                      setProductName('');
                      setSearchFocused(false);
                    }}
                    className="grid grid-cols-[1fr_90px_140px] px-5 py-3 border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-gray-800">{p.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">SKU: {p.sku} · <span className="text-blue-500 font-semibold">₹{p.sale || p.price || 0}/Unit</span></div>
                    </div>
                    <div className="text-[13px] font-semibold text-gray-700 flex items-center justify-center">{p.stock}</div>
                    <div className="flex items-center justify-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] px-3 py-1 rounded-lg font-semibold transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))
            )}

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_90px_140px] px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-800">{item.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {item.sku && <span>SKU: {item.sku} · </span>}
                      <span className="text-blue-500 font-semibold">₹{item.sale || 0} / {item.unit || 'Unit'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[13px] font-semibold text-gray-700 flex items-center justify-center">{item.stock}</div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: String(Math.max(1, parseInt(i.qty || 1) - 1)) } : i))}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-base transition-colors">-</button>
                  <span className="w-8 text-center text-[14px] font-bold text-gray-900">{item.qty}</span>
                  <button onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: String(parseInt(i.qty || 0) + 1) } : i))}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-base transition-colors">+</button>
                </div>
              </div>
            ))}

            {items.length === 0 && !searchFocused && !productName && (
              <div className="flex flex-col items-center justify-center h-28 text-gray-300">
                <Search className="w-7 h-7 mb-2" />
                <p className="text-[12px]">Click search above to browse products</p>
              </div>
            )}
          </div>

          {/* Summary Bar */}
          <div className="px-5 py-3 border-t border-gray-200 grid grid-cols-3 bg-white">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Items</div>
              <div className="text-[15px] font-bold text-gray-900 mt-0.5">{items.length} Products</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Units</div>
              <div className="text-[15px] font-bold text-gray-900 mt-0.5">{items.reduce((a, i) => a + parseInt(i.qty || 0), 0)} Units</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Valuation</div>
              <div className="text-[15px] font-bold text-blue-600 mt-0.5">
                ₹{items.reduce((a, i) => a + (parseInt(i.qty || 0) * (i.sale || 0)), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end items-center gap-3 bg-white">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            background: canSubmit
              ? "linear-gradient(135deg,#1d4ed8,#7c3aed)"
              : "#d1d5db",
            boxShadow: canSubmit
              ? "0 4px 0 #1e3a8a, 0 8px 20px rgba(29,78,216,0.25)"
              : "0 4px 0 #9ca3af",
            transform: "translateY(0)",
            transition: "all 0.15s",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
          onMouseDown={e => { if (canSubmit) { e.currentTarget.style.transform="translateY(4px)"; e.currentTarget.style.boxShadow="0 0 0 #1e3a8a"; } }}
          onMouseUp={e => { if (canSubmit) { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 0 #1e3a8a, 0 8px 20px rgba(29,78,216,0.25)"; } }}
          className="px-6 py-2.5 rounded-lg text-[14px] font-bold text-white flex items-center gap-2"
        >
          Confirm &amp; Process Transfer
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}
