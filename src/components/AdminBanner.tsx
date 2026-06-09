import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function AdminBanner() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    invoke<boolean>("is_running_as_admin").then(setIsAdmin);
  }, []);

  if (isAdmin === null || isAdmin) {
    return null;
  }

  return (
    <div className="admin-banner" role="alert">
      <span className="admin-banner-icon">⚠</span>
      <div>
        <strong>Запустите LLMMonitor от имени администратора</strong> для полноценной работы:
        per-CCD температуры AMD, PPT/мощность, NUMA-топология, CCD pinning и доступ к сенсорам
        LibreHardwareMonitor. ПКМ по ярлыку → «Запуск от имени администратора».
      </div>
    </div>
  );
}
