"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "@/app/(customer)/SessionProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SupportForm() {
  const { user } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (user && formRef.current) {
      const nameInput = formRef.current.elements.namedItem(
        "name",
      ) as HTMLInputElement;
      const emailInput = formRef.current.elements.namedItem(
        "email",
      ) as HTMLInputElement;
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (nameInput) nameInput.value = fullName || user.username || "";
      if (emailInput) emailInput.value = user.email || "";
    }
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (file.size > MAX_SIZE) {
        toast.error("File is too large (Max 5MB).");
        event.target.value = "";
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file type. Only images are allowed.");
        event.target.value = "";
        return;
      }
      setAttachment(file);
      setAttachmentName(file.name);
    } else {
      setAttachment(null);
      setAttachmentName("");
    }
    event.target.value = "";
  };

  const handleAttachmentClick = () => {
    document.getElementById("support-attachment-input")?.click();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    if (!user || !formRef.current) {
      toast.error(!user ? "You must be logged in." : "Form error.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData(formRef.current);
    const loadingToastId = toast.loading("Sending message...");
    try {
      const response = await fetch("/api/support-tickets/create", {
        method: "POST",
        credentials: "include", // Add this line to include cookies
        body: formData,
      });
      toast.dismiss(loadingToastId);
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Message Sent Successfully!", { duration: 2000 });
        formRef.current?.reset();
        setAttachment(null);
        setAttachmentName("");
        if (user && formRef.current) {
          const nameInput = formRef.current.elements.namedItem(
            "name",
          ) as HTMLInputElement;
          const emailInput = formRef.current.elements.namedItem(
            "email",
          ) as HTMLInputElement;
          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
          if (nameInput) nameInput.value = fullName || user.username || "";
          if (emailInput) emailInput.value = user.email || "";
        }
      } else {
        setSubmitError(result.error || "Failed to send message");
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-semibold">
          Contact Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
            <Label htmlFor="subject">
              Subject / Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="e.g., Issue with order #12345"
              disabled={!user || isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              disabled={!user || isSubmitting}
              defaultValue={
                user
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    user.username ||
                    ""
                  : ""
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Your Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={!user || isSubmitting}
              defaultValue={user?.email ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">
              Your Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="Please describe your issue or question in detail..."
              disabled={!user || isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Attachment (Optional - Max 5MB Image)</Label>
            <Input
              type="file"
              id="support-attachment-input"
              name="attachment"
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!user || isSubmitting}
              aria-label="Attach an optional image file (Max 5MB)"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleAttachmentClick}
                disabled={!user || isSubmitting}
              >
                <Paperclip className="mr-2 h-4 w-4" aria-hidden="true" />
                {attachmentName ? "Change File" : "Attach File"}
              </Button>
              {attachmentName && (
                <span className="text-sm text-muted-foreground truncate">
                  {attachmentName}
                </span>
              )}
            </div>
          </div>
          <div>
            <Button
              type="submit"
              disabled={!user || isSubmitting}
              className="w-full"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
          {submitError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          {!user && (
            <Alert
              variant="default"
              className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 text-center"
            >
              <AlertDescription>
                Please log in to submit a support request.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
