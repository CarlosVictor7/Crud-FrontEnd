export const profileRoleNames: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  client: 'Cliente',
};

export const formatProfileDate = (dateString: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
};
