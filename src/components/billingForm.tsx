"use client";

import { getUserSubscriptionPlan } from "@/lib/stripe"
import { useToast } from "./ui/use-toast"
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BillingFormProps{
    subPlan: Awaited<
        ReturnType<typeof getUserSubscriptionPlan>
    >
}

const BillingForm = ({ subPlan }: BillingFormProps) => {
    const { toast } = useToast()

    const { mutate: createStripeSession , isLoading} = trpc.createStripeSession.useMutation({
        onSuccess: ({url}) => {
            if(url) window.location.href = url
            if(!url) return toast({
                title: 'There was a problem processing your payment.',
                description: 'Please try again in a few minutes.',
                variant: 'destructive'
            })
        }
    })
    return (
        <MaxWidthWrapper className="max-w-5xl">
            <form onSubmit={(e) => {
                e.preventDefault()
                createStripeSession()
            }} className="mt-12">
                <Card>
                    <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>You&apos;re currently on the <strong>{subPlan.name || 'Free'}</strong> plan.</CardDescription>
                    </CardHeader>

                    <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                        <Button type="submit">
                            {isLoading ? (
                                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
                            ) : (
                                null
                            )}
                            {subPlan.isSubscribed ? 'Manage subscription' : 'Upgrade to PRO'}
                        </Button>

                        {subPlan.isSubscribed ? (
                            <p className="rounded-full text-xs font-medium">
                                {subPlan.isCanceled ? "Access to PRO will be revoked on " : 'Your plan renews on '}
                                    {format(subPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
                            </p>
                        ) : null}
                    </CardFooter>
                </Card>
            </form>
        </MaxWidthWrapper>
    )
    
}

export default BillingForm