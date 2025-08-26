import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGithubUser, searchGithubUser } from "../api/github";
import { useDebounce } from "use-debounce";
import type { GithubUser } from "../types";

import UserCard from "./UserCard";
import RecentSearches from "./RecentSearchs";

function UserSearch() {
  const [userName, setUserName] = useState("");
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentUsers");
    return stored ? JSON.parse(stored) : [];
  });
  const [submittedUserName, setSubmittedUserName] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName,
  });

  const [debouncedUserName] = useDebounce(userName, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  const { data: suggestions } = useQuery({
    queryKey: ["github-user-suggestion", debouncedUserName],
    queryFn: () => searchGithubUser(debouncedUserName),
    enabled: debouncedUserName.length > 1,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = userName.trim();
    if (!trimmed) return;

    setSubmittedUserName(trimmed);
    setUserName("");

    setRecentUsers((prev) => {
      const updated = [trimmed, ...prev.filter((val) => val !== trimmed)];
      return updated.slice(0, 5);
    });
  };

  useEffect(() => {
    localStorage.setItem("recentUsers", JSON.stringify(recentUsers));
  }, [recentUsers]);

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
          <input
            type="text"
            name=""
            id=""
            placeholder="Enter GitHub username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          ``
          {showSuggestions && suggestions?.length > 0 && (
            <ul className="suggestions">
              {suggestions.slice(0, 5).map((user: GithubUser) => {
                return (
                  <li
                    key={user.name}
                    onClick={() => setSubmittedUserName(user.login)}
                  >
                    <img
                      className="avatar-xs"
                      src={user.avatar_url}
                      alt={user.login}
                    />
                    {user.login}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button disabled={isLoading || isError} type="submit">
          {isLoading ? "Loading..." : "Search"}
        </button>
      </form>

      {isError && <p className="status error">{error.message}</p>}

      {data && <UserCard data={data} />}
      {recentUsers.length > 0 && (
        <RecentSearches
          users={recentUsers}
          onSelect={(userName) => {
            setSubmittedUserName(userName);
            setUserName(userName);
          }}
        />
      )}
    </>
  );
}

export default UserSearch;
