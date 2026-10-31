"use client"

import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";
import api from "@/lib/api";
interface DeleteRowProps {
endpoint: string;
token:string;
}
const DeleteRow = (props: DeleteRowProps) => {
    const Router = useRouter();
    const handleDelete = async () => {
        try {
            const response = await api.delete(`/${props.endpoint}`, {
                headers: {
                    Authorization: `Bearer ${props.token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                console.log("Row deleted successfully");
                Router.refresh();
            } else {
                console.error("Failed to delete row");
            }
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    };

    return (
        <button className="text-[25px] cursor-pointer text-secondry hover:text-primary transition-all duration-300 ease-in" onClick={handleDelete}>
            <MdDelete />
        </button>
    );
}

export default DeleteRow