import { Bot, LucideProps, User } from "lucide-react";

export const Icons = {
    user: User,
    logo: (props: LucideProps) => (
        <Bot {...props} size={32} color="#3266e5" strokeWidth={2.25} />
    )
}