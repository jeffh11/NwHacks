import { Card } from "@/components/ui/card";

export default function Post({ post }: { post: { id: string, content: string, created_at: string } }) {
	return (
		<Card key={post.id}>
			<p className="text-gray-800 mb-2">{post.content}</p>
			<p className="text-xs text-gray-400">
				{new Date(post.created_at).toLocaleString()}
			</p>
		</Card>
	)
}