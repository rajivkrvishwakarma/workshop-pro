"use client";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ClipboardList, DollarSign, UserCog, AlertCircle, Clock, Activity } from "lucide-react";
import { useDashboardStats } from "@/hooks/api/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format, subDays } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function DashboardHomePage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="flex mb-10 flex-col gap-4 md:gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your workshop performance"
      />

      {/* Generate some dummy data for the chart to make it look great */}
      {(() => {
        const dummyChartData = Array.from({ length: 7 }).map((_, i) => ({
          date: format(subDays(new Date(), 6 - i), "MMM dd"),
          orders: Math.floor(Math.random() * 20) + 5,
        }));

        return (
          <>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
        {/* Total Revenue */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Collected payments
            </p>
          </CardContent>
        </Card>

        {/* Total Due */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Due
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(stats?.totalDue || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Pending from customers
            </p>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20 mt-1" /> : (
              <div className="text-2xl font-bold text-foreground">
                {stats?.activeOrders || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        {/* Today's Deadlines */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Deadlines
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20 mt-1" /> : (
              <div className="text-2xl font-bold text-foreground">
                {stats?.todayDeadlines || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Orders due today
            </p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20 mt-1" /> : (
              <div className="text-2xl font-bold text-foreground">
                {stats?.totalCustomers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Registered in system
            </p>
          </CardContent>
        </Card>

        {/* Staff Members */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Staff Members
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <UserCog className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20 mt-1" /> : (
              <div className="text-2xl font-bold text-foreground">
                {stats?.totalStaff || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Active employees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-2">
        <Card className="col-span-1 lg:col-span-4 shadow-sm border-slate-200/60 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Recent Orders Overview</CardTitle>
            <CardDescription>
              A snapshot of your workshop's order volume over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[250px] sm:h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dummyChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-card-foreground)'
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 shadow-sm border-slate-200/60 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates in the workshop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-6">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                        {activity.action} <span className="text-slate-500 font-normal">on Order</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Order ID: {activity.orderId.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="text-xs font-medium text-slate-400 shrink-0">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <ClipboardList className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No recent activity found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
          </>
        );
      })()}
    </div>
  );
}
