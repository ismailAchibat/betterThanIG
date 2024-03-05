import UserCard from "@/components/shared/UserCard";
import { toast } from "@/components/ui/use-toast";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";

const AllUsers = () => {
  const {
    data: users,
    isPending: isUserLoading,
    isError: isErrorUsers,
  } = useGetUsers();

  if (isErrorUsers) {
    toast({ title: "Something went wrong." });
    return;
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {users?.documents.map((user) => (
          <li key={user?.$id} className="flex-1 min-w-[200px] w-full">
            <UserCard user={user} />
          </li>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
