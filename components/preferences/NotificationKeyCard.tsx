/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotificationKey } from "@/hooks/useNotificationKey";
import { toast } from "sonner";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { cn } from "@/lib/utils";

export function NotificationKeyCard() {
  const { data: status, refetch } = useWalletRegistrationStatus();
  const { registerKey, rotateKey, revokeKey, isLoading } = useNotificationKey();
  const [isHovered, setIsHovered] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);

  const hasKey = !!status?.notificationKey;

  const handleRegister = async () => {
    try {
      await registerKey();
      toast.success("Notification key registered successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to register notification key");
    }
  };

  const handleRotate = async () => {
    try {
      await rotateKey();
      toast.success("Notification key rotated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to rotate notification key");
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeKey();
      toast.success("Notification key revoked successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke notification key");
    }
  };

  return (
    <div
      className="bg-card-2 border border-border-2 rounded-xl p-4 sm:p-5 mb-6 flex flex-col transition-all duration-200 hover:border-teal/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top row: icon + info + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        {/* Left: icon + text */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
              hasKey ? "bg-teal/15 text-teal" : "bg-border text-text-muted"
            )}
          >
            <Key size={16} className="sm:hidden" />
            <Key size={18} className="hidden sm:block" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h4 className="text-[13px] sm:text-[14px] font-bold text-text-primary">
                E2E Encryption Key
              </h4>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0",
                  hasKey
                    ? "bg-teal/10 text-teal"
                    : "bg-border text-text-muted"
                )}
              >
                {hasKey ? "Active" : "Not Set"}
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-text-muted truncate">
              {hasKey
                ? `Version ${status.notificationKey?.version} • Rotated ${status.notificationKey?.rotationCount} times`
                : "Required to receive encrypted notifications."}
            </p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          {hasKey ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRotate}
                disabled={isLoading}
                className="flex-1 sm:flex-initial"
              >
                {isLoading ? "Rotating..." : "Rotate Key"}
              </Button>
              {/* Show revoke on hover (desktop) or via toggle (mobile) */}
              {(isHovered || showRevoke) && (
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 sm:flex-initial bg-red-200 bg-opacity-10 text-red-700 hover:bg-opacity-20 border border-red/20"
                  onClick={handleRevoke}
                  disabled={isLoading}
                >
                  Revoke
                </Button>
              )}
              {/* On mobile, show a toggle for revoke since hover doesn't exist */}
              {!isHovered && !showRevoke && (
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden flex-1"
                  onClick={() => setShowRevoke(true)}
                >
                  •••
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" onClick={handleRegister} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Generating..." : "Generate Key"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
