import { RemoteSelector, RemoteSelectorProps } from '../RemoteSelector';
import { GHUserItem } from './GHRepoItem';
import { GHUserListItem } from './GHUserListItem';
import { getUserText, isUserEquals, searchUser } from './utils';

export type RemoteUserInfo = {
  id: number
  login: string
}

export interface GHUserSelectorProps extends Pick<RemoteSelectorProps<any>, 'id' | 'renderInput'> {
  user: RemoteUserInfo | undefined;
  onUserSelected: (repo: RemoteUserInfo | undefined) => void;
}

export function GHUserSelector ({ user, onUserSelected, ...props }: GHUserSelectorProps) {
  return (
    <RemoteSelector<RemoteUserInfo>
      {...props}
      getItemText={getUserText}
      value={user ? [user] : []}
      onSelect={onUserSelected}
      getRemoteOptions={searchUser}
      renderSelectedItems={([item]) => <GHUserItem id={props.id} item={item} onClear={() => onUserSelected(undefined)} />}
      renderListItem={props => <GHUserListItem key={props.item.id} {...props} />}
      equals={isUserEquals}
    />
  );
}
