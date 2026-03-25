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

export const formatProfileLastLogin = (dateString?: string | null) => {
  if (!dateString) {
    return 'Nunca acessou';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Nunca acessou';
  }

  const datePart = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${datePart} às ${timePart}`;
};
