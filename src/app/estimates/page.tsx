"use client";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useState } from "react";

export default function EstimatesPage() {
	const { estimates, clients, addEstimate } = useStore();
	const [showModal, setShowModal] = useState(false);
	const [selectedClient, setSelectedClient] = useState<string>("");
	const [estimateName, setEstimateName] = useState("");

	// Sort estimates by createdAt descending
	const sortedEstimates = [...estimates].sort((a, b) => b.createdAt - a.createdAt);

	function getClientName(estimate: { clientId: string; projectId?: string }): string {
		const client = clients.find(c => c.id === estimate.clientId);
		return client ? client.name : "Unknown";
	}

		return (
			<div className="p-8">
				<h1 className="text-2xl font-bold mb-6">All Estimates</h1>
				<button className="mb-6 px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setShowModal(true)}>New Estimate</button>
				{showModal && (
					<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
						<div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
							<h2 className="text-lg font-bold mb-4">Create New Estimate</h2>
							{clients.length === 0 ? (
								<div className="mb-4">
									<div className="mb-2 text-red-600">You must add a client before creating an estimate.</div>
									<Link href="/clients">
										<button className="px-4 py-2 rounded bg-blue-600 text-white w-full">Add Client</button>
									</Link>
								</div>
							) : (
								<>
									<label className="block mb-2">Client</label>
									<select className="border rounded px-2 py-1 w-full mb-4" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
										<option value="">Select a client</option>
										{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</select>
									<label className="block mb-2">Estimate Name</label>
									<input className="border rounded px-2 py-1 w-full mb-4" value={estimateName} onChange={e => setEstimateName(e.target.value)} placeholder="Estimate name" />
									<div className="flex gap-2 justify-end">
										<button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
										<button className="px-4 py-2 rounded bg-blue-600 text-white" disabled={!selectedClient} onClick={() => {
											const id = addEstimate({ clientId: selectedClient, name: estimateName || "Untitled Estimate", items: [] });
											setShowModal(false);
											setSelectedClient("");
											setEstimateName("");
											window.location.href = `/estimates/${id}`;
										}}>Create</button>
									</div>
								</>
							)}
						</div>
					</div>
				)}
				{sortedEstimates.length === 0 ? (
					<div className="text-gray-500">No estimates found.</div>
				) : (
					<table className="min-w-full border rounded bg-white">
						<thead>
							<tr className="bg-gray-100">
								<th className="px-4 py-2 text-left">Estimate Name</th>
								<th className="px-4 py-2 text-left">Client</th>
								<th className="px-4 py-2 text-left">Modified</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{sortedEstimates.map(estimate => (
								<tr key={estimate.id} className="border-b">
									<td className="px-4 py-2">{estimate.name || "Untitled Estimate"}</td>
									<td className="px-4 py-2">{getClientName(estimate)}</td>
									<td className="px-4 py-2">{new Date(estimate.createdAt).toLocaleString()}</td>
									<td className="px-4 py-2">
										<Link href={`/estimates/${estimate.id}`} className="text-blue-600 hover:underline">Open</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		);
	}