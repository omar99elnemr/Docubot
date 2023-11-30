import { Feather, LucideProps, User } from "lucide-react";

export const Icons = {
    user: User,
    logo: (props: LucideProps) => (
        <Feather {...props} />
    )
}