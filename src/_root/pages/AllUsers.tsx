import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { toast } from "@/components/ui/use-toast";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";

const AllUsers = () => {
  const {
    data: users,
    isError: isErrorUsers,
    isPending: isUsersLoading,
  } = useGetUsers();

  if (isErrorUsers) {
    toast({ title: "Something went wrong." });
    return;
  }

  return (
    <div className="common-container">
      <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
      {isUsersLoading && <Loader />}
      <div className="flex flex-wrap gap-4 flex-row place-content-center">
        {users?.documents.map((user) => (
          <li key={user?.$id} className="flex-1 min-w-[300px] max-w-[300px]">
            <UserCard user={user} />
          </li>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
