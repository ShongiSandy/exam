// app/(customer)/page.tsx
import { validateRequest } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Actions ---
import {
  getCustomerOrderCount,
  getCustomerOrders,
} from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-orders";
import { getCustomerWishlistCount } from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-wishlist";
import { getCustomerSentTicketCount } from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-support-tickets";

// --- Icons ---
import {
  ShoppingBag,
  Heart,
  Calendar,
  CreditCard,
  KeyRound,
  Award,
  MessagesSquare,
  CheckCheck,
  Banknote,
  LifeBuoy,
  LucideProps,
} from "lucide-react";
import Link from "next/link";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Import TierBadge ---
import TierBadge from "@/app/(public)/_components/(navbar_group)/TierBadge";

// --- Type Definitions for Action Cards ---
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type LinkActionCard = {
  title: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
  value?: string | number;
  isTierCard?: never;
};

type TierActionCard = {
  title: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  isTierCard: true;
  value?: never;
  href?: never;
};

type ActionCardItem = LinkActionCard | TierActionCard;

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper function to map order status to badge variant
const getStatusVariant = (
  status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return "default";
    case "pending":
    case "processing":
      return "secondary";
    case "cancelled":
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

export default async function CustomerDashboardPage() {
  const { user } = await validateRequest();

  // Fetch all necessary data
  const [
    orderCountResponse,
    wishlistCountResponse,
    ordersResponse,
    ticketCountResponse,
  ] = await Promise.all([
    getCustomerOrderCount(),
    getCustomerWishlistCount(),
    getCustomerOrders(),
    getCustomerSentTicketCount(),
  ]);

  // Process standard counts
  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;
  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;
  const supportTicketsSentCount = ticketCountResponse.success
    ? ticketCountResponse.ticketCount || 0
    : 0;

  // Process all orders data
  const allOrders =
    ordersResponse.success && Array.isArray(ordersResponse.orders)
      ? ordersResponse.orders
      : [];
  const latestOrders = allOrders.slice(0, 5);

  const deliveredOrdersCount = allOrders.filter(
    (order) => order.status?.toUpperCase() === "DELIVERED",
  ).length;

  const totalAmountSpent = allOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );

  const subscriptionCount = 1;

  const summaryCards = [
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingBag,
      href: "/customer/orders",
    },
    {
      title: "Support Tickets Sent",
      value: supportTicketsSentCount,
      icon: LifeBuoy,
      href: "/customer/support",
    },
    {
      title: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      href: "/customer/wishlist",
    },
    {
      title: "Delivered Orders",
      value: deliveredOrdersCount,
      icon: CheckCheck,
      href: "/customer/orders?status=delivered",
    },
    {
      title: "Total Amount Spent",
      value: formatCurrency(totalAmountSpent),
      icon: Banknote,
      href: "/customer/orders",
    },
    {
      title: "Subscriptions",
      value: subscriptionCount,
      icon: Calendar,
      href: "/customer/subscriptions",
    },
  ];

  const actionCards: ActionCardItem[] = [
    {
      title: "Change Password",
      icon: KeyRound,
      href: "/customer/settings?tab=security",
    },
    { title: "Order History", icon: ShoppingBag, href: "/customer/orders" },
    {
      title: "My Messages",
      icon: MessagesSquare,
      href: "/customer/mymessages",
    },
    {
      title: "Payment Details",
      icon: CreditCard,
      href: "/customer/payment-methods",
    },
    { title: "Tier Status", icon: Award, isTierCard: true },
  ];

  return (
    <div className="min-h-screen -m-6 lg:-m-8 bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.displayName || "Customer"}!
          </h1>
          <p className="text-muted-foreground mt-2">Here&apos;s what&apos;s happening with your account</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((item, index) => (
            <Link
              href={item.href || "#"}
              key={index}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                  <item.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track your latest purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/customer/orders/${order.id}`}
                              className="text-primary hover:underline"
                            >
                              #{order.id ? order.id.substring(0, 8) : "N/A"}...
                            </Link>
                          </TableCell>
                          <TableCell>{order.orderItems?.length || 0}</TableCell>
                          <TableCell>
                            <ShadcnBadge
                              variant={getStatusVariant(order.status)}
                              className="capitalize"
                            >
                              {order.status?.toLowerCase() || "unknown"}
                            </ShadcnBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {actionCards.map((item, index) => (
                    item.isTierCard ? (
                      <Card key={index} className="bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                          <item.icon className="h-6 w-6 text-primary" />
                          <p className="text-sm font-medium">{item.title}</p>
                          <TierBadge />
                        </CardContent>
                      </Card>
                    ) : (
                      <Link
                        href={item.href}
                        key={index}
                        className="transform hover:scale-105 transition-transform duration-200"
                      >
                        <Card>
                          <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                            <item.icon className="h-6 w-6 text-primary" />
                            <p className="text-sm font-medium">{item.title}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
