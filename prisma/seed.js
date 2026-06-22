const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@robiwood.com";
  const senha = "admin123";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log("Usuário admin já existe:", email);
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.user.create({
    data: {
      nome: "Administrador",
      email,
      senha: senhaHash,
      cargo: "ADMIN",
    },
  });

  console.log("Usuário admin criado com sucesso!");
  console.log("E-mail:", email);
  console.log("Senha:", senha);
  console.log("⚠️  Troque essa senha após o primeiro login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
