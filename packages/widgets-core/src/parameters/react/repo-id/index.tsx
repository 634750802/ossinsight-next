import { GHRepoSelector, RemoteRepoInfo, RemoteSelectorInputProps, GHOrgRepoSelector } from '@ossinsight/ui';
import { useCallback, useContext } from 'react';
import { ParametersContext } from '../context';

export function RepoIdInput ({ id, value, onValueChange }: { id: string, value: number, onValueChange: (newValue: number | undefined) => void }) {
  const { linkedData } = useContext(ParametersContext);

  const handleRepoChange = useCallback((repo: RemoteRepoInfo | undefined) => {
    if (repo) {
      linkedData.repos[String(repo.id)] = repo;
    }
    onValueChange(repo?.id);
  }, []);

  const repo = linkedData.repos[String(value)];

  return (
    <GHRepoSelector
      id={id}
      repo={repo}
      onRepoSelected={handleRepoChange}
      renderInput={renderInput}
    />
  );
}

function renderInput (props: RemoteSelectorInputProps) {
  return <input className="TextInput" {...props}
                type={(props as any).type === 'button' ? undefined : (props as any).type} />;
}

export function RepoIdsInput({
  id,
  value = [],
  onValueChange,
  ownerId,
}: {
  id: string;
  value: number[];
  onValueChange: (newValue: number[] | undefined) => void;
  ownerId?: number | null;
}) {
  const { linkedData } = useContext(ParametersContext);

  const repos = value?.map((repoId) => linkedData.repos[String(repoId)]) || [];
  const org = linkedData.orgs[String(ownerId)];

  const handleSelectRepo = useCallback(
    (repo: RemoteRepoInfo | undefined) => {
      if (repo) {
        linkedData.repos[String(repo.id)] = repo;
      }
      onValueChange([...value, repo?.id].filter((i) => i != null) as number[]);
    },
    [value]
  );

  const handleRemoveRepo = useCallback(
    (repo: RemoteRepoInfo) => {
      onValueChange(value.filter((i) => i !== repo.id));
    },
    [value]
  );

  return (
    <>
      <GHOrgRepoSelector
        repos={[]}
        onRepoSelected={handleSelectRepo}
        renderInput={renderInput}
        onRepoRemoved={handleRemoveRepo}
        orgName={org?.login}
        maxItems={5}
      />
    </>
  );
}