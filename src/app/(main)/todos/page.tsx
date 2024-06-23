import { getSSRSession } from "@/lib/get-server-session";
import { CreateTodoButton } from "./_components/create-todo-button";
import { getTodosUseCase } from "@/use-cases/todos";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { Todo } from "./_components/todo";
import { getAllUsersUseCase } from "@/use-cases/users";
import { isUserSubscribed } from "@/use-cases/subscriptions"; // Import the subscription check function

export default async function TodosPage() {
  const { user } = await getSSRSession();

  if (!user) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  const todos = await getTodosUseCase(user.id);
  const users = await getAllUsersUseCase();

  const hasTodos = todos.length > 0;
  const hasUsers = users.length > 0;

  // Check if the user is subscribed
  const subscribed = await isUserSubscribed(user.id);

  return (
    <div className="max-w-2xl mx-auto w-full py-12 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl">Your Todos</h1>
        <CreateTodoButton />
      </div>

      <hr className="border-b my-4" />

      {hasTodos && (
        <div className="flex flex-col gap-4">
          {todos.map((todo) => (
            <Todo todo={todo} key={todo.id} />
          ))}
        </div>
      )}

      {hasUsers && (
        <div className="flex flex-col gap-4">
          {users.map((user, index) => (
            <div key={index}>{user.name}</div>
          ))}
        </div>
      )}

      {!hasTodos && (
        <div className="mt-24 text-2xl flex items-center justify-center">
          <p>You have no todos</p>
        </div>
      )}

      {/* Display subscription status */}
      <div className="mt-8">
        {subscribed ? (
          <p className="text-green-600">
            You are subscribed. Enjoy premium features!
          </p>
        ) : (
          <p className="text-red-600">
            You are not subscribed. Subscribe to access premium features.
          </p>
        )}
      </div>
    </div>
  );
}
