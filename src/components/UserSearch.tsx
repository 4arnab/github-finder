import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGithubUser, searchGithubUser } from "../api/github";
import { useDebounce } from "use-debounce";
import type { GithubUser } from "../types";

import UserCard from "./UserCard";
import RecentSearches from "./RecentSearchs";
import Suggestions from "./Suggestions";

function UserSearch() {
  const [userName, setUserName] = useState("");
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentUsers");
    return stored ? JSON.parse(stored) : [];
  });
  const [submittedUserName, setSubmittedUserName] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName,
  });

  const [debouncedUserName] = useDebounce(userName, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [searching, setSearching] = useState(false);

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
            name="githubsearch"
            id="githubsearch"
            placeholder="Enter GitHub username"
            value={userName}
            onChange={(e) => {
              const value = e.target.value;
              setUserName(value);
              setShowSuggestions(value.trim().length > 1);
            }}
          />
          {showSuggestions && suggestions?.length > 0 && (
            <Suggestions
              show={showSuggestions}
              suggestions={suggestions}
              onSelect={(userName) => {
                setSubmittedUserName(userName);
                setShowSuggestions(false);

                if (submittedUserName !== userName) {
                  setSubmittedUserName(userName);
                } else {
                  refetch();
                }

                setRecentUsers((prev) => {
                  const updated = [
                    userName,
                    ...prev.filter((val) => val !== userName),
                  ];
                  return updated.slice(0, 5);
                });
              }}
            />
          )}
        </div>
        <button disabled={isLoading} type="submit">
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
