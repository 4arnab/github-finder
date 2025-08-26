import { FaGithubAlt } from "react-icons/fa";
import type { GithubUser } from "../types";
function UserCard({ data }: { data: GithubUser }) {
  return (
    <div className="user-card">
      <img className="avatar" src={data.avatar_url} alt={data.login} />
      <h2>{data.name || data.login}</h2>
      <p className="bio">{data.bio}</p>
      <a
        className="profile-btn"
        href={data.html_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithubAlt />
        View Github Profile
      </a>
    </div>
  );
}

export default UserCard;
