import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Copy,
  Share,
  X,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  LinkIcon,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// ShareButtons Component - renders a social sharing interface for colleges
function ShareButtons({ collegeName, className }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const title = `Check out below item at the College Fair!`

  // Handles copy to clipboard logic
  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  // Array of sharing platform options
  const shareOptions = [
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      color: "bg-[#3b5998] hover:bg-[#2d4373]",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl,
          )}&quote=${encodeURIComponent(title)}`,
          "_blank",
        ),
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-4 w-4" />,
      color: "bg-[#1DA1F2] hover:bg-[#0c85d0]",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            shareUrl,
          )}&text=${encodeURIComponent(title)}`,
          "_blank",
        ),
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      color: "bg-[#25D366] hover:bg-[#1da851]",
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`,
          "_blank",
        ),
    },
    {
      name: "Email",
      icon: <Mail className="h-4 w-4" />,
      color: "bg-[#D44638] hover:bg-[#b23121]",
      onClick: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(
            title,
          )}&body=${encodeURIComponent("Check this out: " + shareUrl)}`,
          "_blank",
        ),
    },
    {
      name: "Copy Link",
      icon: <LinkIcon className="h-4 w-4" />,
      color: "bg-gray-600 hover:bg-gray-700",
      onClick: handleCopy,
    },
  ]

  return (
    <div className={cn("relative", className)}>
      <TooltipProvider>
        <Popover open={open} onOpenChange={setOpen}>
          {/* Share Button with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 w-9 p-0 border-gray-200 hover:bg-gray-100 transition-all"
                  aria-label="Share"
                >
                  <Share className="h-4 w-4 text-blue-700" />
                  <span className="sr-only">Share</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Share</p>
            </TooltipContent>
          </Tooltip>

          {/* Popover Content */}
          <PopoverContent
            className="w-72 p-0 rounded-lg shadow-lg border border-gray-200"
            align="end"
            sideOffset={5}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <h3 className="font-medium text-sm">Share this to college</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Share Description */}
            <div className="p-3">
              <p className="mb-3 text-sm text-gray-500">
                Share a link at <strong>{collegeName}</strong> with your friends
                and social networks.
              </p>

              {/* Share Buttons Grid */}
              <div className="grid grid-cols-2 gap-2">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex items-center justify-center gap-2 text-white border-0 transition-all",
                      option.color,
                      option.name === "Copy Link" &&
                        copied &&
                        "bg-green-600 hover:bg-green-700",
                    )}
                    onClick={option.onClick}
                  >
                    {option.icon}
                    <span className="text-xs font-medium">
                      {option.name === "Copy Link" && copied
                        ? "Copied!"
                        : option.name}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Link Preview + Copy Button */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <div className="truncate text-xs text-gray-500 flex-1">
                    {shareUrl.length > 40
                      ? `${shareUrl.substring(0, 40)}...`
                      : shareUrl}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-2 text-xs rounded-md transition-colors",
                      copied ? "text-green-600" : "text-gray-700",
                    )}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <span className="mr-1">Copied</span>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  )
}

export default ShareButtons
