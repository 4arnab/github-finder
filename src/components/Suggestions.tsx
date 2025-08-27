import type { GithubUser } from "../types";

type SuggestionsDropdownProps = {
  suggestions: GithubUser[];
  show: boolean;
  onSelect: (userName: string) => void;
};
function Suggestions({
  show,
  onSelect,
  suggestions,
}: SuggestionsDropdownProps) {
  if (!show || suggestions.length === 0) return null;

  return (
    <ul className="suggestions">
      {suggestions.slice(0, 5).map((user: GithubUser) => {
        return (
          <li key={user.name} onClick={() => onSelect(user.login)}>
            <img className="avatar-xs" src={user.avatar_url} alt={user.login} />
            {user.login}
          </li>
        );
      })}
    </ul>
  );
}

export default Suggestions;
