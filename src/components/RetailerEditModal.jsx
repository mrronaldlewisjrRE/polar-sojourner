import { useEffect } from "react";

export default function RetailerEditModal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "rgba(0,0,0,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "900px",
                    maxHeight: "calc(100vh - 40px)",
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
                }}
            >
                {/* HEADER */}
                <div
                    style={{
                        padding: "16px",
                        borderBottom: "1px solid #334155",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#0f172a"
                    }}
                >
                    <h2 style={{ margin: 0, color: 'white' }}>{title || 'Edit Retailer'}</h2>

                    <button
                        onClick={onClose}
                        style={{
                            fontSize: "22px",
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer"
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "24px",
                        scrollBehavior: "smooth",
                        color: 'white'
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
