"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { FileUploader } from "../file-uploader";
import { SignaturePad } from "../signature-pad";
import { Steps } from "../steps";
import { UserAgreement } from "@/components/user-agreement";

const membershipFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  dateOfBirth: z
    .date({
      required_error: "Date of birth is required",
    })
    .refine(
      (date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        return m < 0 || (m === 0 && today.getDate() < date.getDate())
          ? age - 1 >= 21
          : age >= 21;
      },
      { message: "You must be at least 21 years old" },
    ),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional(),
  phoneNumber: z
    .string()
    .min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "ZIP code is required" }),
  membershipType: z.string({
    required_error: "Please select a membership type",
  }),
  idFront: z.string().min(1, { message: "Front of ID is required" }),
  idBack: z.string().min(1, { message: "Back of ID is required" }),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  signature: z.string().min(1, { message: "Signature is required" }),
  referrerId: z.string().optional(),
});

export type MembershipFormValues = z.infer<typeof membershipFormSchema>;

export default function MembershipForm({
  referrerId,
}: {
  referrerId?: string;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { title: "Personal Information", description: "Basic details" },
    { title: "Address", description: "Where you live" },
    { title: "Verification", description: "ID verification" },
    { title: "Agreement", description: "Terms & signature" },
  ];

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      membershipType: "standard",
      idFront: "",
      idBack: "",
      termsAgreed: false,
      signature: "",
      referrerId: referrerId || "",
    },
  });

  const nextStep = () => {
    const fieldsToValidate = [
      // Step 1 fields
      currentStep === 0
        ? ["firstName", "lastName", "dateOfBirth", "phoneNumber"]
        : [],
      // Step 2 fields
      currentStep === 1
        ? ["address", "city", "state", "zipCode", "membershipType"]
        : [],
      // Step 3 fields
      currentStep === 2 ? ["idFront", "idBack"] : [],
      // Step 4 fields
      currentStep === 3 ? ["termsAgreed", "signature"] : [],
    ].flat();

    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  async function onSubmit(data: MembershipFormValues) {
    setIsSubmitting(true);

    try {
      // Send data to the API endpoint
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create member");
      }

      toast.success(
        `${data.firstName} ${data.lastName} has been registered successfully`,
      );

      // Redirect to success page
      router.push("/dashboard/members/registration-success");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <Steps
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow going back to previous steps
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-6"
          >
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              // Disable future dates and dates less than 21 years ago
                              const today = new Date();
                              const twentyOneYearsAgo = new Date();
                              twentyOneYearsAgo.setFullYear(
                                today.getFullYear() - 21,
                              );
                              return date > today || date > twentyOneYearsAgo;
                            }}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1940}
                            toYear={new Date().getFullYear() - 21}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        You must be at least 21 years old to register.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          For order notifications and updates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Anytown" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a membership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Different membership types offer different benefits and
                        discounts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-medium">ID Verification</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Please upload clear images of the front and back of your
                    government-issued ID. Acceptable formats include driver's
                    license, passport, or state ID.
                  </p>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="idFront"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Front of ID</FormLabel>
                          <FormControl>
                            <FileUploader
                              value={field.value}
                              onChange={field.onChange}
                              accept="image/*"
                              maxSize={5}
                              label="Upload front of ID"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idBack"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Back of ID</FormLabel>
                          <FormControl>
                            <FileUploader
                              value={field.value}
                              onChange={field.onChange}
                              accept="image/*"
                              maxSize={5}
                              label="Upload back of ID"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-medium">
                    Membership Agreement
                  </h3>

                  {/* Using the UserAgreement component here */}
                  <UserAgreement />

                  <FormField
                    control={form.control}
                    name="termsAgreed"
                    render={({ field }) => (
                      <FormItem className="mt-4 flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I have read and agree to the membership terms and
                            conditions
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature</FormLabel>
                      <FormControl>
                        <SignaturePad
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Please sign using your finger or mouse
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Registration Date: {format(new Date(), "PPP")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
