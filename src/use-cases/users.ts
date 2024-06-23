import { deleteUser, getAllUsers } from "@/data-access/users";

export async function deleteUserUseCase(
	userId: string,
	userToDeleteId: string
) {
	if (userId !== userToDeleteId) {
		throw new Error("You can only delete your own account");
	}

	await deleteUser(userId);
}

// Function to get all users
export async function getAllUsersUseCase() {
	const users = await getAllUsers();
	return users;
}
