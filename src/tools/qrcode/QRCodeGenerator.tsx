// @ts-nocheck

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TOOL_PANEL_CLASS } from "../../design-system/foundations/layout";
import { encodeUrlQueryParams } from "../../../model/url";
import { Helmet } from "react-helmet";
import QRCode from "qrcode";
import { useLocation, useNavigate } from "react-router-dom";

// Interface definitions for saved QR codes
interface SavedQRCode {
  id: string;
  url: string;
  nickname: string;
  createdAt: number;
  qrCodeUrl: string;
  settings: {
    size: number;
    errorCorrection: string;
    darkColor: string;
    lightColor: string;
  };
}

const DeepLinkQRGenerator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialLink = searchParams.get("link") || "";

  const [input, setInput] = useState<string>(initialLink);
  const [encodedLink, setEncodedLink] = useState<string>("");
  const [size, setSize] = useState<number>(256);
  const [errorCorrection, setErrorCorrection] = useState<string>("M");
  const [darkColor, setDarkColor] = useState<string>("#000000");
  const [lightColor, setLightColor] = useState<string>("#FFFFFF");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isRunningLink, setIsRunningLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showCosmeticOptions, setShowCosmeticOptions] =
    useState<boolean>(false);
  const [autoEncode, setAutoEncode] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileOS, setMobileOS] = useState<string>("");

  // Recently generated links
  const [recentLinks, setRecentLinks] = useState<string[]>([]);
  const MAX_RECENT_LINKS = 10;

  const recentLinksBlock = recentLinks.length > 0 && (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="text-xl font-semibold mb-4">Recent Links</h2>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {recentLinks.map((link) => (
          <li key={link} className="break-all">
            <button
              type="button"
              onClick={() => setInput(link)}
              className="text-blue-600 hover:underline"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Collection related state
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");

  // Large QR code modal state
  const [showLargeQRModal, setShowLargeQRModal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const addRecentLink = useCallback((link: string) => {
    if (!link) return;
    setRecentLinks((prev) => {
      const updated = [link, ...prev.filter((l) => l !== link)].slice(0, MAX_RECENT_LINKS);
      try {
        localStorage.setItem("recentLinks", JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recent links:", error);
      }
      return updated;
    });
  }, []);

  // Check if device is mobile and load saved QR codes
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(
          userAgent,
        );
      setIsMobile(isMobileDevice);
      if (/android/i.test(userAgent)) setMobileOS("Android");
      else if (/iphone|ipad|ipod/i.test(userAgent)) setMobileOS("iPhone");
      else setMobileOS("");
    };

    checkMobile();

    // Load saved cosmetic options
    const savedOptions = localStorage.getItem("qrCosmeticOptions");
    if (savedOptions) {
      try {
        const options = JSON.parse(savedOptions);
        setSize(options.size || 256);
        setErrorCorrection(options.errorCorrection || "M");
        setDarkColor(options.darkColor || "#000000");
        setLightColor(options.lightColor || "#FFFFFF");
        setShowCosmeticOptions(options.showCosmeticOptions || false);
        setAutoEncode(options.autoEncode !== false);
      } catch (error) {
        console.error("Error loading saved options:", error);
      }
    }

    // Load saved QR codes from localStorage
    const savedCodes = localStorage.getItem("savedQRCodes");
    if (savedCodes) {
      try {
        setSavedQRCodes(JSON.parse(savedCodes));
      } catch (error) {
        console.error("Error loading saved QR codes:", error);
      }
    }

    const storedRecent = localStorage.getItem("recentLinks");
    if (storedRecent) {
      try {
        setRecentLinks(JSON.parse(storedRecent));
      } catch (error) {
        console.error("Error loading recent links:", error);
      }
    }

    // Handle URL query parameter for link
    if (initialLink) {
      try {
        // First try to decode the URL in case it's already URL encoded
        const decodedLink = decodeURIComponent(initialLink);

        // Ensure the link has a valid protocol by trying to parse it
        try {
          const url = new URL(decodedLink);
          setInput(decodedLink);
        } catch {
          // If no protocol, add https:// prefix
          setInput(`https://${decodedLink}`);
        }
      } catch (error) {
        console.error("Invalid URL:", error);
        setInput(initialLink); // Use as-is if decoding fails
      }
    }
  }, [initialLink]);

  // Save cosmetic options to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "qrCosmeticOptions",
        JSON.stringify({
          size,
          errorCorrection,
          darkColor,
          lightColor,
          showCosmeticOptions,
          autoEncode,
        }),
      );
    } catch (error) {
      console.error("Error saving options:", error);
    }
  }, [
    size,
    errorCorrection,
    darkColor,
    lightColor,
    showCosmeticOptions,
    autoEncode,
  ]);

  // Generate QR code when input or properties change
  useEffect(() => {
    if (input) {
      const processed = autoEncode ? encodeUrlQueryParams(input) : input;
      setEncodedLink(processed);
      // Generate QR code after short debounce
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        generateQRCode();
      }, 300) as unknown as number;
    } else {
      setQrCodeUrl("");
      setEncodedLink("");
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [input, size, errorCorrection, darkColor, lightColor, autoEncode]);


  // Clear toast message after 2 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Show helper message if deeplink taking too long
  useEffect(() => {
    if (isRunningLink) {
      const timer = setTimeout(() => {
        setToastMessage(
          "If nothing happens, the app may not be installed or this link type isn't supported on your device.",
        );
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isRunningLink]);

  // Generate QR code using the qrcode library
  const generateQRCode = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas || !input) return;

      // Configure QR code options
      const options = {
        errorCorrectionLevel: errorCorrection,
        margin: 1,
        width: size,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      };

      const linkForQR = autoEncode ? encodeUrlQueryParams(input) : input;

      // Generate QR code on canvas
      await QRCode.toCanvas(canvas, linkForQR, options);

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const copyToClipboard = useCallback((text: string, message: string) => {
    try {
      navigator.clipboard.writeText(text);
      setToastMessage(message);
    } catch (error) {
      console.error("Clipboard error:", error);
      setToastMessage(
        "Clipboard access denied. Please update your browser permissions.",
      );
    }
  }, []);

  const handleCopyEncodedLink = () => {
    if (!encodedLink) return;
    copyToClipboard(encodedLink, "Encoded link copied!");
    addRecentLink(encodedLink);
  };

  const handleCopyRawLink = () => {
    if (!input) return;
    copyToClipboard(input, "Link copied!");
    addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
  };

  const handleCopyQRAsImage = async () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      // Try to use the clipboard API for images if supported
      if (navigator.clipboard && navigator.clipboard.write) {
        const clipboardItem = new ClipboardItem({
          [blob.type]: blob,
        });
        await navigator.clipboard.write([clipboardItem]);
        setToastMessage("QR image copied to clipboard!");
        addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
      } else {
        // Fallback - create a temp link and download
        const link = document.createElement("a");
        link.download = `qrcode-${input.substring(0, 15).replace(/[^a-zA-Z0-9]/g, "-")}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToastMessage(
          "QR image downloaded (copy not supported in this browser)",
        );
        addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
      }
    } catch (error) {
      console.error("Error copying QR:", error);
      handleDownloadQR();
      setToastMessage("Image copy failed - downloaded instead");
    }
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current || !input) return;

    // Generate a new canvas with the QR code and URL text
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Set sizes to allow for text below QR code
    const padding = 20;
    tempCanvas.width = size + padding * 2;
    tempCanvas.height = size + padding * 3 + 20; // Extra space for text

    if (ctx) {
      // Fill with light color
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the QR code from our hidden canvas
      ctx.drawImage(canvasRef.current, padding, padding, size, size);

      // Draw the URL text below QR code
      ctx.font = "12px Arial";
      ctx.fillStyle = "#333333";
      ctx.textAlign = "center";

      // Truncate long URLs for display
      const displayText =
        input.length > 50 ? input.substring(0, 47) + "..." : input;
      ctx.fillText(displayText, tempCanvas.width / 2, size + padding * 2);

      // Add a "Generated with MyDebugger" note
      ctx.font = "10px Arial";
      ctx.fillStyle = "#666666";
      ctx.fillText(
        "Generated with MyDebugger QR Tool",
        tempCanvas.width / 2,
        size + padding * 2 + 15,
      );
    }

    // Create download link
    const link = document.createElement("a");
    const fileName = `qrcode-${input.substring(0, 15).replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.download = fileName;
    link.href = tempCanvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("QR code downloaded!");
    addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
  };

  const handleRunLink = () => {
    if (!input) return;

    setIsRunningLink(true);
    setTimeout(() => {
      try {
        const linkToOpen = autoEncode ? encodeUrlQueryParams(input) : input;
        window.location.href = linkToOpen;
      } catch (error) {
        console.error("Error opening link:", error);
        setToastMessage("Error opening link");
      }
      setTimeout(() => setIsRunningLink(false), 1000);
      addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
    }, 10);
  };

  const handleSharePageWithLink = () => {
    if (!input) return;

    try {
      // Create a URL object for the current page
      const currentUrl = new URL(window.location.href);

      // Reset any existing search parameters
      currentUrl.search = "";

      // Add the properly encoded link parameter
      const shareLink = autoEncode ? encodeUrlQueryParams(input) : input;
      const encodedLink = encodeURIComponent(shareLink);
      currentUrl.searchParams.set("link", encodedLink);

      // Copy the full URL to clipboard
      copyToClipboard(
        currentUrl.toString(),
        "Shareable link copied! Send to your team.",
      );
      addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
    } catch (error) {
      console.error("Error creating shareable link:", error);
      setToastMessage("Error creating shareable link");
    }
  };

  const handleReset = () => {
    setInput("");
    setIsRunningLink(false);

    // Don't reset cosmetic options as they're persistent
    // Instead update the URL to remove the link param
    navigate("/qrcode", { replace: true });
  };

  // Save QR code to collection
  const handleSaveToCollection = () => {
    if (!input || !qrCodeUrl) return;
    setShowSaveModal(true);
    // Set default nickname based on URL
    const domain = new URL(input).hostname || input.split("/")[0].split("?")[0];
    setNickname(domain || "My QR Code");
  };

  // Save QR code with nickname to collection
  const handleConfirmSave = () => {
    if (!input || !qrCodeUrl) return;

    const newCode: SavedQRCode = {
      id: `qr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: input,
      nickname: nickname || "My QR Code",
      createdAt: Date.now(),
      qrCodeUrl,
      settings: {
        size,
        errorCorrection,
        darkColor,
        lightColor,
      },
    };

    const updatedCollection = [...savedQRCodes, newCode];
    setSavedQRCodes(updatedCollection);

    // Save to localStorage
    try {
      localStorage.setItem("savedQRCodes", JSON.stringify(updatedCollection));
      setToastMessage("QR code saved to collection!");
      addRecentLink(autoEncode ? encodeUrlQueryParams(input) : input);
    } catch (error) {
      console.error("Error saving to collection:", error);
      setToastMessage("Error saving QR code");
    }

    setShowSaveModal(false);
    setNickname("");
  };

  // Load QR code from collection
  const handleLoadFromCollection = (saved: SavedQRCode) => {
    setInput(saved.url);
    setSize(saved.settings.size);
    setErrorCorrection(saved.settings.errorCorrection);
    setDarkColor(saved.settings.darkColor);
    setLightColor(saved.settings.lightColor);
    setQrCodeUrl(saved.qrCodeUrl);
  };

  // Remove QR code from collection
  const handleRemoveFromCollection = (id: string) => {
    const updatedCollection = savedQRCodes.filter((code) => code.id !== id);
    setSavedQRCodes(updatedCollection);

    // Save to localStorage
    try {
      localStorage.setItem("savedQRCodes", JSON.stringify(updatedCollection));
      setToastMessage("Removed from collection");
    } catch (error) {
      console.error("Error removing from collection:", error);
    }
  };

  // Show large QR code
  const handleShowLargeQR = () => {
    if (!qrCodeUrl) return;
    setShowLargeQRModal(true);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSaveModal(false);
        setShowLargeQRModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  // SEO metadata
  const pageTitle = "Deep-Link Tester & QR Generator | MyDebugger";
  const pageDescription =
    "Generate QR codes for links & deeplinks, test them directly and share with your team.";

  return (
    <>
      <Helmet>
        <title>
          Deep-Link Tester & QR Code Generator for iOS & Android Apps
        </title>
        <meta
          name="description"
          content="Test mobile deep links instantly and generate QR codes for iOS/Android schemes like trueapp:// or custom URLs. Share encoded links with your team easily."
        />
        <meta
          property="og:title"
          content="Deep-Link Tester & QR Generator – MyDebugger"
        />
        <meta
          property="og:description"
          content="Create deep link QR codes, auto-encode safe URLs, and run links on devices. Built for mobile app teams."
        />
        <meta property="og:image" content="/og-deeplink-preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mydebugger.vercel.app/qrcode" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Deep-Link Tester & QR Generator",
            url: "https://mydebugger.vercel.app/qrcode",
            applicationCategory: "DeveloperTool",
            description:
              "Test and share mobile deep links with QR code generation for iOS and Android apps.",
            creator: { "@type": "Person", name: "Jirad Sreerattana-arporn" },
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          Deep-Link Tester & QR Generator
        </h1>
        <p className="text-gray-600 mb-8">
          Generate QR codes for any URL or mobile deep link (e.g,
          <code>trueapp://</code>, <code>myapp://</code>, or
          <code>https://</code>). This tool auto-encodes query parameters,
          previews safe links, and lets you test instantly on your own device.
        </p>

        {/* Toast Message */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
            {toastMessage}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Input Section */}
          <div className="flex-1">
            <div
              className={`border border-gray-200 ${TOOL_PANEL_CLASS.replace("p-6", "p-5")}`}
            >
              <label
                htmlFor="input"
                className="block font-medium text-gray-700 mb-2"
              >
                URL or Deeplink
              </label>
              <input
                type="text"
                id="input"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mb-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRunLink();
                  }
                }}
                placeholder="https://example.com/"
                autoFocus
              />

              <label className="inline-flex items-center mb-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={autoEncode}
                  onChange={(e) => setAutoEncode(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Auto-encode query params
                </span>
              </label>

              {/* Encoded URL Display */}
              {encodedLink && (
                <div className="mt-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percent-Encoded (Safe for Sharing)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={encodedLink}
                      onFocus={(e) => e.target.select()}
                      onClick={handleCopyEncodedLink}
                      className="flex-1 bg-gray-50 rounded-md border border-gray-300 p-2 text-sm text-gray-600 break-all cursor-copy"
                    />
                    <button
                      onClick={handleCopyEncodedLink}
                      className="ml-2 px-3 flex-shrink-0 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                      title="Copy encoded link"
                    >
                      <svg
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {recentLinksBlock}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  onClick={handleCopyRawLink}
                  disabled={!input}
                  className={`flex items-center justify-center px-4 py-2 rounded-md text-white transition ${
                    input
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Copy Raw Link
                </button>
                <button
                  onClick={handleSharePageWithLink}
                  disabled={!input}
                  className={`flex items-center justify-center px-4 py-2 rounded-md text-white transition ${
                    input
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share Page with Link Pre-filled
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleRunLink}
                  disabled={!input}
                  className={`flex items-center justify-center px-4 py-2 rounded-md text-white transition ${
                    input
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {isRunningLink
                    ? "Opening..."
                    : isMobile
                      ? `Open on ${mobileOS || "Device"}`
                      : "Run on This Device"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset
                </button>
              </div>

              {/* Collapsible Cosmetic Options */}
              <details
                className="mt-6 border-t border-gray-200 pt-4"
                open={showCosmeticOptions}
              >
                <summary
                  className="text-md font-medium text-gray-700 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCosmeticOptions(!showCosmeticOptions);
                  }}
                >
                  <span className="flex items-center">
                    <svg
                      className={`h-5 w-5 mr-2 transition-transform ${showCosmeticOptions ? "transform rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    Customize QR Code
                  </span>
                </summary>

                <div className="pt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="size"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Size (px)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="size"
                        className="flex-1 mr-3"
                        min="128"
                        max="512"
                        step="8"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value))}
                      />
                      <div className="text-sm text-gray-500 w-12 text-right">
                        {size}px
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="errorCorrection"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Error Correction
                      </label>
                      <select
                        id="errorCorrection"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        value={errorCorrection}
                        onChange={(e) => setErrorCorrection(e.target.value)}
                      >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="darkColor"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Dark Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          id="darkColor"
                          className="h-8 w-8 rounded mr-2"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lightColor"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Light Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          id="lightColor"
                          className="h-8 w-8 rounded mr-2"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* QR Code Output Section */}
          <div className="flex-1">
            <div
              className={`border border-gray-200 h-full flex flex-col ${TOOL_PANEL_CLASS.replace("p-6", "p-5")}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">QR Code Preview</h2>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-4 rounded bg-gray-50 border border-gray-100 mb-4">
                {qrCodeUrl ? (
                  <>
                    <img
                      src={qrCodeUrl}
                      alt={`QR Code for: ${input}`}
                      className="mb-4 max-w-full cursor-pointer hover:opacity-90 transition"
                      style={{ maxHeight: `${size}px`, height: "auto" }}
                      onClick={handleShowLargeQR}
                      title="Click to view larger size"
                    />
                    <div className="text-xs text-center text-gray-500 break-all mt-2 px-4">
                      {input.length > 50 ? `${input.slice(0, 47)}...` : input}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                    <svg
                      className="h-16 w-16 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p>Enter a URL or deeplink to generate QR code</p>
                  </div>
                )}
              </div>

              <canvas
                ref={canvasRef}
                style={{ display: "none" }}
                width={size}
                height={size}
              />

              {/* QR Actions */}
              {qrCodeUrl && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyQRAsImage}
                    className="flex items-center justify-center px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Copy QR Image
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PNG
                  </button>
                  <button
                    onClick={handleSaveToCollection}
                    className="flex items-center justify-center px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save to My Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Deep-Link Testing Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-blue-500 mb-3">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-2">App Deeplinks</h3>
              <p className="text-sm text-gray-600">
                For custom scheme deeplinks (like <code>myapp://</code>), scan
                the QR code with a phone that has the app installed.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-blue-500 mb-3">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Share with Team</h3>
              <p className="text-sm text-gray-600">
                Use "Share Page with Link Pre-filled" to send a ready-to-use
                link to teammates with the QR already configured.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-blue-500 mb-3">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Testing Best Practices</h3>
              <p className="text-sm text-gray-600">
                For regression testing, first test your deeplinks on a fresh app
                install before testing on your development build.
              </p>
            </div>
          </div>
        </div>

        {/* Related Debugging Tools */}
        <section className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">
            Related Debugging Tools
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a
                href="/url-inspector"
                className="text-blue-600 hover:underline"
              >
                URL Parameter Inspector
              </a>
            </li>
            <li>
              <a
                href="/base64-decode"
                className="text-blue-600 hover:underline"
              >
                Text Base64 Decoder
              </a>
            </li>
          </ul>
        </section>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              ref={modalRef}
              className={`w-full max-w-md ${TOOL_PANEL_CLASS}`}
            >
              <h3 className="text-lg font-medium mb-4">
                Save QR Code to My Collection
              </h3>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nickname
              </label>
              <input
                type="text"
                id="nickname"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 mb-4"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter a nickname for this QR code"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Large QR Modal */}
        {showLargeQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              ref={modalRef}
              className={`w-full max-w-3xl ${TOOL_PANEL_CLASS}`}
            >
              <h3 className="text-lg font-medium mb-4">Large QR Code</h3>
              <div className="flex justify-center mb-4">
                <img
                  src={qrCodeUrl}
                  alt="Large QR Code"
                  className="max-w-full"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLargeQRModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Collection */}
        {savedQRCodes.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">My Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedQRCodes.map((code) => (
                <div
                  key={code.id}
                  className="bg-white p-4 rounded-md border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">{code.nickname}</h3>
                    <button
                      onClick={() => handleRemoveFromCollection(code.id)}
                      className="text-red-500 hover:text-red-600 transition"
                      title="Remove from collection"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <img
                    src={code.qrCodeUrl}
                    alt={`QR Code for: ${code.url}`}
                    className="mb-2 max-w-full"
                  />
                  <div className="text-xs text-gray-500 break-all mb-2">
                    {code.url}
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleLoadFromCollection(code)}
                      className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleShowLargeQR()}
                      className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition"
                    >
                      View Large
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeepLinkQRGenerator;
