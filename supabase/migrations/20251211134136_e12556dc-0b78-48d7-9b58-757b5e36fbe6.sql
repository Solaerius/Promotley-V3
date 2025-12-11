-- Create swish_orders table for managing Swish payments
CREATE TABLE public.swish_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text NOT NULL,
  company_name text,
  plan text NOT NULL,
  amount integer NOT NULL,
  swish_message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  rejected_by uuid REFERENCES auth.users(id),
  rejected_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.swish_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.swish_orders
FOR SELECT
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users can create orders
CREATE POLICY "Authenticated users can create orders"
ON public.swish_orders
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
ON public.swish_orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.swish_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_swish_orders_status ON public.swish_orders(status);
CREATE INDEX idx_swish_orders_email ON public.swish_orders(email);
CREATE INDEX idx_swish_orders_order_id ON public.swish_orders(order_id);

-- Trigger for updated_at
CREATE TRIGGER update_swish_orders_updated_at
BEFORE UPDATE ON public.swish_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();