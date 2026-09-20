
"use client";

import { useState } from "react";

import {
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

import {
  SiGmail,
} from "react-icons/si";

import {
  FiShare2,
  FiLink,
  FiUsers,
  FiX,
} from "react-icons/fi";

type ArticleShareProps = {
  title: string;
  url: string;
};

export default function ArticleShare({
  title,
  url,
}: ArticleShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const shareText = `${title}\n${url}`;

  // WHATSAPP
  const whatsappUrl =
    "https://api.whatsapp.com/send?text=" +
    encodeURIComponent(shareText);

  // TELEGRAM
  const telegramUrl =
    "https://t.me/share/url?url=" +
    encodeURIComponent(url) +
    "&text=" +
    encodeURIComponent(title);

  // FACEBOOK
  const facebookUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(url);

  // GMAIL
  const gmailUrl =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    "&su=" +
    encodeURIComponent(title) +
    "&body=" +
    encodeURIComponent(shareText);

  // COPY LINK
  async function copyLink(
    successMessage = "Article link copied!"
  ) {
    try {
      await navigator.clipboard.writeText(url);

      setMessage(successMessage);
      setIsOpen(false);
    } catch {
      setMessage(
        "Unable to copy automatically. Open the article and copy its URL."
      );
    }
  }

  function closeMenu() {
    setIsOpen(false);
    setMessage("");
  }

  const optionClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition hover:bg-white/10";

  return (
    <div className="w-full sm:w-auto">

      {/* MAIN SHARE BUTTON */}

      <button
        type="button"
        onClick={() => {
          setIsOpen((previous) => !previous);
          setMessage("");
        }}
        aria-expanded={isOpen}
        aria-label="Share article"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-blue-400/25 hover:bg-blue-500/10 hover:text-blue-200"
      >
        <FiShare2 size={15} />
        Share
      </button>

      {/* SHARE MENU */}

      {isOpen && (
        <div className="mt-3 w-full rounded-2xl border border-white/15 bg-slate-950 p-3 shadow-2xl sm:w-72">

          {/* MENU HEADER */}

          <div className="mb-3 flex items-center justify-between border-b border-white/10 px-2 pb-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Share Article
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Choose where to share
              </p>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close sharing menu"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
            >
              <FiX size={17} />
            </button>
          </div>

          {/* WHATSAPP */}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className={`${optionClass} text-slate-200`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <FaWhatsapp size={21} />
            </span>

            <span>WhatsApp</span>
          </a>

          {/* TELEGRAM */}

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className={`${optionClass} text-slate-200`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#229ED9]/15 text-[#229ED9]">
              <FaTelegramPlane size={20} />
            </span>

            <span>Telegram</span>
          </a>

          {/* FACEBOOK */}

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className={`${optionClass} text-slate-200`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/15 text-[#1877F2]">
              <FaFacebookF size={19} />
            </span>

            <span>Facebook</span>
          </a>

          {/* GMAIL */}

          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className={`${optionClass} text-slate-200`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-[#EA4335]">
              <SiGmail size={21} />
            </span>

            <span>Email via Gmail</span>
          </a>

          {/* INSTAGRAM */}

          <button
            type="button"
            onClick={() =>
              copyLink(
                "Link copied! Open Instagram and paste it into a direct message."
              )
            }
            className={`${optionClass} text-slate-200`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-[#E4405F]">
              <FaInstagram size={21} />
            </span>

            <span>
              Instagram
              <span className="block text-[10px] font-normal text-slate-500">
                Copy link for Instagram
              </span>
            </span>
          </button>

          {/* CONTACTS */}

          <button
            type="button"
            onClick={() =>
              copyLink(
                "Link copied! Open your messaging app, choose a contact, and paste the link."
              )
            }
            className={`${optionClass} text-slate-200`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <FiUsers size={20} />
            </span>

            <span>
              Contacts
              <span className="block text-[10px] font-normal text-slate-500">
                Copy link for a contact
              </span>
            </span>
          </button>

          {/* COPY LINK */}

          <div className="mt-3 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => copyLink()}
              className={`${optionClass} text-blue-300`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FiLink size={20} />
              </span>

              <span>Copy Article Link</span>
            </button>
          </div>
        </div>
      )}

      {/* STATUS MESSAGE */}

      {message && (
        <p
          role="status"
          className="mt-2 max-w-72 rounded-lg border border-blue-400/10 bg-blue-500/5 p-2 text-xs leading-5 text-blue-300"
        >
          {message}
        </p>
      )}
    </div>
  );
}