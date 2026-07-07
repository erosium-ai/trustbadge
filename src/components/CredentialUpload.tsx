"use client";

import { useState } from "react";
import { uploadCredential } from "@/lib/trustbadge";
import { CREDENTIAL_LABELS, type CredentialType, type Credential } from "@/lib/types";

type Props = {
  trustbadgeId: string;
  initialCredentials: Credential[];
};

export function CredentialUpload({ trustbadgeId, initialCredentials }: Props) {
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [type, setType] = useState<CredentialType>("trade_license");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      const result = await uploadCredential(trustbadgeId, type, file, referenceNumber.trim() || undefined);

      if (!result.success || !result.credential) {
        setError(result.error ?? "Upload failed");
        setLoading(false);
        return;
      }

      setCredentials((prev) => [result.credential as Credential, ...prev]);
      setFile(null);
      setReferenceNumber("");
      setMessage("Credential uploaded and is pending verification");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function statusBadge(status: Credential["status"]) {
    const styles = {
      pending: "bg-amber-100 text-amber-800",
      verified: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Add credential
        </h3>
        <p className="text-sm text-slate-600">
          Upload licences, insurance, or certificates for review.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Credential type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CredentialType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {Object.entries(CREDENTIAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Licence / registration number (optional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. 12345678"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              File
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mt-4 text-sm text-emerald-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Uploading…" : "Upload credential"}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Your credentials
        </h3>

        {credentials.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No credentials uploaded yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {credentials.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {CREDENTIAL_LABELS[c.type]}
                  </p>
                  {c.reference_number && (
                    <p className="text-xs text-slate-500">
                      Ref: {c.reference_number}
                    </p>
                  )}
                  {c.file_url && (
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-600 hover:underline"
                    >
                      View file
                    </a>
                  )}
                </div>
                {statusBadge(c.status)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
