import { useState, useCallback } from "react";
import { openPDF, downloadPDF } from "../utils/pdfUtils";

/**
 * Hook customizado para manejar acceso a PDFs con control de premium
 *
 * Maneja:
 * - Detección de contenido premium
 * - Mostrar modal de login para usuarios no autenticados
 * - Mostrar modal de upgrade para usuarios estándar
 * - Abrir/descargar PDFs exitosamente
 *
 * Retorna:
 * - isPremiumGateOpen: boolean - si está abierto el modal
 * - premiumGateData: object - datos para mostrar en el modal
 * - handleOpenPDF: function - manejador para abrir PDF
 * - handleDownloadPDF: function - manejador para descargar PDF
 * - closePremiumGate: function - cerrar el modal
 * - handlePremiumAction: function - callback cuando el usuario intenta volverse premium
 * - handleLoginAction: function - callback cuando el usuario intenta iniciar sesión
 */
export const usePDFAccess = () => {
  const [isPremiumGateOpen, setIsPremiumGateOpen] = useState(false);
  const [premiumGateData, setPremiumGateData] = useState({
    contentTitle: "",
    requiresLogin: false,
    requiresPremium: false,
  });
  const [currentAction, setCurrentAction] = useState(null); // 'open' o 'download'

  const closePremiumGate = useCallback(() => {
    setIsPremiumGateOpen(false);
    setCurrentAction(null);
  }, []);

  const handleOpenPDF = useCallback(async (options) => {
    const result = await openPDF(options);

    if (!result.success) {
      if (result.code === "NOT_AUTHENTICATED") {
        setPremiumGateData({
          contentTitle: options.title || result.contentTitle,
          requiresLogin: true,
          requiresPremium: false,
        });
        setCurrentAction("open");
        setIsPremiumGateOpen(true);
      } else if (result.code === "REQUIRES_PREMIUM") {
        setPremiumGateData({
          contentTitle: options.title || result.contentTitle,
          requiresLogin: false,
          requiresPremium: true,
        });
        setCurrentAction("open");
        setIsPremiumGateOpen(true);
      } else {
        console.error("Error opening PDF:", result.error);
      }
      return result;
    }

    return result;
  }, []);

  const handleDownloadPDF = useCallback(async (options) => {
    const result = await downloadPDF(options);

    if (!result.success) {
      if (result.code === "NOT_AUTHENTICATED") {
        setPremiumGateData({
          contentTitle: options.title || result.contentTitle,
          requiresLogin: true,
          requiresPremium: false,
        });
        setCurrentAction("download");
        setIsPremiumGateOpen(true);
      } else if (result.code === "REQUIRES_PREMIUM") {
        setPremiumGateData({
          contentTitle: options.title || result.contentTitle,
          requiresLogin: false,
          requiresPremium: true,
        });
        setCurrentAction("download");
        setIsPremiumGateOpen(true);
      } else {
        console.error("Error downloading PDF:", result.error);
      }
      return result;
    }

    return result;
  }, []);

  return {
    isPremiumGateOpen,
    premiumGateData,
    handleOpenPDF,
    handleDownloadPDF,
    closePremiumGate,
    currentAction,
  };
};

export default usePDFAccess;
