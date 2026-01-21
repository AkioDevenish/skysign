import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalPaymentProps {
    amount: string;
    planName: string;
    onSuccess: () => void;
}

export default function PayPalPayment({ amount, planName, onSuccess }: PayPalPaymentProps) {
    const initialOptions = {
        "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb", // "sb" is sandbox
        currency: "USD",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <div className="w-full">
                <p className="text-sm text-center text-stone-500 mb-4">
                    Pay with Debit or Credit Card via PayPal
                </p>
                <PayPalButtons
                    style={{ layout: "vertical", color: "black", label: "pay" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    description: `Sky Sign ${planName} Plan`,
                                    amount: {
                                        currency_code: "USD",
                                        value: amount,
                                    },
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            await actions.order.capture();
                            onSuccess();
                        }
                    }}
                />
            </div>
        </PayPalScriptProvider>
    );
}
