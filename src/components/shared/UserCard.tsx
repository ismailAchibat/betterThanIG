import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import PostStats from "./PostStats";

type UserCardProps = {
  user: Models.Document;
};

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      {/* <Button type="button" size="sm" className="shad-button_primary px-5">
        Follow
      </Button> */}
      <StatBlock value={user.followers.length} label="Followers" />
    </Link>
  );
};

export default UserCard;
