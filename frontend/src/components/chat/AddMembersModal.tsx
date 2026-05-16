import { Search, SquareCheckBigIcon } from "lucide-react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { SearchSelect, type SelectOption } from "@/components/forms/SearchSelect";

type SelectedMember = { nama: string; email: string };

type Props = {
  open: boolean;
  selectedMemberValue: string;
  searchKeyword: string;
  memberOptions: SelectOption[];
  selectedMembers: SelectedMember[];
  isSearchPending?: boolean;
  isAddPending?: boolean;
  onChangeSearchKeyword: (value: string) => void;
  onSelectMember: (value: string) => void;
  onRemoveMember: (email: string) => void;
  onClose: () => void;
  onAdd: () => void;
};

export function AddMembersModal({
  open,
  selectedMemberValue,
  searchKeyword,
  memberOptions,
  selectedMembers,
  isSearchPending,
  isAddPending,
  onChangeSearchKeyword,
  onSelectMember,
  onRemoveMember,
  onClose,
  onAdd,
}: Props) {
  return (
    <ModalTemplate open={open} onClose={onClose} title="Add Members" maxWidthClassName="max-w-lg">
      <div className="space-y-3">
        <SearchSelect
          label="Search Member"
          leftIcon={<Search size={16} />}
          value={selectedMemberValue}
          options={memberOptions}
          onChange={onSelectMember}
          searchValue={searchKeyword}
          onSearchChange={onChangeSearchKeyword}
          searchPlaceholder="Type email keyword"
          emptyText="No users"
          loading={isSearchPending}
        />

        <div className="flex flex-wrap gap-1">
          {selectedMembers.map((member) => (
            <button
              key={member.email}
              className="flex w-full items-center gap-3 rounded bg-cyan-300/5 px-3 py-2"
              onClick={() => onRemoveMember(member.email)}
            >
              <div>
                <SquareCheckBigIcon className="size-4" />
              </div>
              <div className="w-full">
                <p className="max-w-[calc(100%-50px)] truncate text-start text-sm font-medium">
                  {member.nama}
                </p>
                <p className="max-w-[calc(100%-50px)] truncate text-start text-xs text-slate-300">
                  {member.email}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button className="rounded bg-white/10 px-3 py-1 text-xs" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900 disabled:opacity-60"
            onClick={onAdd}
            disabled={isAddPending || selectedMembers.length === 0}
          >
            Add
          </button>
        </div>
      </div>
    </ModalTemplate>
  );
}
