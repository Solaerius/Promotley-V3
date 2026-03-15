import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const RECOVERY_DELAY_MS = 5000;

const CheckoutRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Förbereder betalning...");
  const [showRecoveryActions, setShowRecoveryActions] = useState(false);

  const plan = searchParams.get("plan");
  const pkg = searchParams.get("package");
  const type = searchParams.get("type");

  useEffect(() => {
    let ignore = false;

    const slowCheckoutTimer = window.setTimeout(() => {
      if (ignore) return;
      setStatusMessage("Det här tar längre tid än väntat. Vi försöker fortfarande starta betalningen.");
      setShowRecoveryActions(true);
    }, RECOVERY_DELAY_MS);

    const startCheckout = async () => {
      const planKey = plan || pkg;
      const purchaseType = type === "plan" ? "subscription" : "one_time";

      if (!planKey) {
        setError("Ogiltig betalningslänk. Välj ett paket från prissidan.");
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("billing", {
          body: { planKey, type: purchaseType },
        });

        if (ignore) return;

        if (fnError || !data?.url) {
          console.error("Checkout error:", fnError);
          setError("Något gick fel vid betalningen. Försök igen.");
          return;
        }

        window.location.assign(data.url);
      } catch (err) {
        if (ignore) return;
        console.error("Checkout error:", err);
        setError("Något gick fel vid betalningen. Försök igen.");
      }
    };

    startCheckout();

    return () => {
      ignore = true;
      window.clearTimeout(slowCheckoutTimer);
    };
  }, [plan, pkg, type]);

  const actionButtonClassName =
    "border-white/25 text-white hover:bg-white/10 hover:text-white";

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center">
          <div className="w-full rounded-3xl border border-white/15 bg-black/20 p-8 text-center text-white shadow-elegant backdrop-blur-xl">
            <h1 className="text-2xl font-bold">Något gick fel</h1>
            <p className="mt-3 text-sm text-white/75">{error}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                className={actionButtonClassName}
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Försök igen
              </Button>
              <Link to="/pricing">
                <Button variant="outline" className={actionButtonClassName}>
                  Tillbaka till prissidan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl border border-white/15 bg-black/20 p-8 text-center text-white shadow-elegant backdrop-blur-xl">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-white" />
          <h1 className="mt-6 text-2xl font-bold">Startar checkout</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">{statusMessage}</p>

          {showRecoveryActions && (
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                Om du fortfarande är kvar här kan du prova igen.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  className={actionButtonClassName}
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ladda om
                </Button>
                <Button
                  variant="outline"
                  className={actionButtonClassName}
                  onClick={() => navigate("/pricing")}
                >
                  Tillbaka till prissidan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutRedirect;
