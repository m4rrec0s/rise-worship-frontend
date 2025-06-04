"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/app/hooks/use-api";
import { Setlist } from "@/app/types/setlist";
import { useAuth } from "@/app/context/auth-context";
import SetListList from "@/app/components/setlist/setlist-list";

interface MemberData {
  id: string;
  permission: string;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

export default function GroupSetlistsPage() {
  const params = useParams();
  const api = useApi();
  const groupId = params.groupId as string;
  const { user } = useAuth();

  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [permission, setPermission] = useState("");

  const getSetListsByGroup = api.getSetListsByGroup;
  const getGroupMembers = api.getGroupMembers;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const setlistsResponse = await getSetListsByGroup(groupId);
        setSetlists(setlistsResponse);

        const membersResponse = await getGroupMembers(groupId);
        const permissionFound = membersResponse.find(
          (member: MemberData) => member.user.id === user?.id
        );
        if (permissionFound) {
          setPermission(permissionFound.permission);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, user]);

  return (
    <SetListList
      groupId={groupId}
      setlists={setlists}
      userPermissions={permission}
    />
  );
}
