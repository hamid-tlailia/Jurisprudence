import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page">
      <div className="empty">
        <Compass size={40} />
        <h1 className="title-lg" style={{ color: "var(--ink)" }}>
          لم نجد هذه الصفحة
        </h1>
        <p>لعل الرابط تغيّر أو كُتب خطأ.</p>
        <Link to="/" className="btn btn-primary">
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
