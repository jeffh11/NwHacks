import Link from "next/link";
import Button from "../../../components/button";

export default function JoinFamilySuccessPage() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
			<h1 className="text-4xl font-bold text-amber-900 mb-4">
				Successfully Joined Family!
			</h1>
			<p className="text-lg text-amber-800">
				You have successfully joined your family. You can now access family features.
			</p>
			<div className="w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white mt-3 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
				<Link href="/protected/feed">
					<Button text="Go to Feed" />
				</Link>
			</div>
		</main>
	)
}