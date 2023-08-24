"use client";

import {
  MeDocument,
  MeQuery,
  useMeQuery,
  useUpdateProfileMutation,
} from "@/__generated__/graphql";
import AlertMessage from "@/components/AlertMessage";
import { useForm } from "react-hook-form";

function EditName() {
  const [updateName, { client, data }] = useUpdateProfileMutation();
  const { data: meData } = useMeQuery();
  const meName = meData?.me?.name;
  const {
    formState: { defaultValues, errors },
    register,
    watch,
    handleSubmit,
  } = useForm({
    defaultValues: {
      newName: meName,
    },
  });

  const onSubmit = async (data: any) => {
    if (data.newName === meName) {
      return;
    }
    await updateName({
      variables: {
        name: data.newName,
      },
      update: (_, { data }) => {
        if (!data) {
          return null;
        }
        client.writeQuery<MeQuery>({
          query: MeDocument,
          data: {
            __typename: "Query",
            me: data.updateProfile.data?.user,
          },
        });
      },
    });
  };
  return (
    <div>
      <form className="flex" onSubmit={handleSubmit(onSubmit)}>
        <>
          <div>
            <input
              defaultValue={defaultValues?.newName}
              {...register("newName", {
                required: true,
                minLength: 4,
              })}
              placeholder="Type here..."
              className="input input-bordered"
            />
            {errors.newName && (
              <p className="text-red-500 font-semibold">Minimum 4 characters</p>
            )}
          </div>
        </>
        <button type="submit" className="btn ml-4">
          change
        </button>
      </form>
      {data && <AlertMessage message={"Your Name has been Changed!"} />}
    </div>
  );
}
export default EditName;
