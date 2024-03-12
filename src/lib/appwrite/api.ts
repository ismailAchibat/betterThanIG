import { ID, Query } from "appwrite";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";


export async function createUserAccount(user: INewUser){
    try{
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name)

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        })

       return newUser;
    }
    catch(error){
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}){
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )
        return newUser;

    } catch (error) {
        console.log(error);
    }
}

export async function signInAccount(user: {email: string; password: string;}) {
    try {
        const session = await account.createEmailSession(user.email, user.password);
        return session;
    } catch (error) {
        console.log(error);
    }
    
}

export async function getCurrentUser() {
    try {
        const currentAccount  = await account.get();
        if(!currentAccount) throw Error;
        const CurrentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!CurrentUser) throw Error;

        return CurrentUser.documents[0];
    
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current")

        return session;
    } catch (error) {
        console.log(error)
    }
}

export async function createPost(post: INewPost) {
    try {
      // Upload file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
  
      if (!uploadedFile) throw Error;
  
      // Get file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
  
      // Convert tags into array
      const tags = post.tags?.replace(/ /g, "").split(",") || [];
  
      // Create post
      const newPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        ID.unique(),
        {
          creator: post.userId,
          caption: post.caption,
          imageUrl: fileUrl,
          imageId: uploadedFile.$id,
          location: post.location,
          tags: tags,
        }
      );
  
      if (!newPost) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
  
      return newPost;
    } catch (error) {
      console.log(error);
    }
  }
  
  // ============================== UPLOAD FILE
  export async function uploadFile(file: File) {
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      );
  
      return uploadedFile;
    } catch (error) {
      console.log(error);
    }
  }
  
  // ============================== GET FILE URL
  export function getFilePreview(fileId: string) {
    try {
      const fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
  
      if (!fileUrl) throw Error;
  
      return fileUrl;
    } catch (error) {
      console.log(error);
    }
  }
  
  // ============================== DELETE FILE
  export async function deleteFile(fileId: string) {
    try {
      await storage.deleteFile(appwriteConfig.storageId, fileId);
  
      return { status: "ok" };
    } catch (error) {
      console.log(error);
    }
  }

  export async function getRecentPosts(){
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if(!posts) throw Error;
    return posts;
  }

  export async function likePost(postId:string , likesArray: string[]) {
    try {
      const updatedPost = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId,
        {
          likes: likesArray,
        }
      )
      if(!updatedPost) throw Error;

      return updatedPost;
      
    } catch (error) {
      console.log(error);
    }
  }

export async function savePost(postId:string , userId: string) {
    try {
      const updatedPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.savesCollectionId,
        ID.unique(),
        {
          user: userId,
          post: postId,
        }
      )
      if(!updatedPost) throw Error;

      return updatedPost;
      
    } catch (error) {
      console.log(error);
    }
  }

  export async function deleteSavedPost(savedRecordId:string) {
    try {
      const statusCode = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.savesCollectionId,
        savedRecordId,
      )
      if(!statusCode) throw Error;

      return {status: 'ok'};
      
    } catch (error) {
      console.log(error);
    }
  }

  export async function getPostById(postId:string) {
    try {
      const post = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
      )

      return post;
    } catch (error) {
      console.log(error);
    }
  }

  export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;
    try {
      let image = {
        imageUrl: post.imageUrl,
        imageId: post.imageId,
      }

      if(hasFileToUpdate){
        // Upload file to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw Error;
        
        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw Error;
        }

        image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
      }
  
  
  
      // Convert tags into array
      const tags = post.tags?.replace(/ /g, "").split(",") || [];
  
      // Create post
      const UpdatedPost = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        post.postId,
        {
          caption: post.caption,
          imageUrl: image.imageUrl,
          imageId: image.imageId,
          location: post.location,
          tags: tags,
        }
      );
  
      if (!UpdatedPost) {
        await deleteFile(post.postId);
        throw Error;
      }
  
      return UpdatedPost;
    } catch (error) {
      console.log(error);
    }
  }

  export async function deletePost(postId:string, imageId:string) {
    if(!postId || !imageId) throw Error;
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId,
      )
      return {status: 'ok'};
    } catch(error) {
      console.log(error);
    }
}



export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getUsers() {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.orderAsc("$createdAt")]
    )
    if(!users) throw Error;
    return users;
}

export async function getUserById(userId: string) {
  const user = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId
  )
  if(!user) throw Error;
  return user;
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function checkIsFollowing(currentUserId: string, userIdToFollow: string){
  try {
    const currentUser = await getUserById(currentUserId);
    if(currentUser.following.includes(userIdToFollow)){
      return true;
    }
    else{
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function AddFollowerOfUserById(currentUserId: string, userIdToFollow: string) {
  try {
    const userToFollow = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userIdToFollow
    );

    const currentUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUserId
    );

    if (!userToFollow || !currentUser) {
      throw Error;
    }

    userToFollow.followers.push(currentUserId);

    const updatedUserToFollow = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userIdToFollow,
      {
        followers: userToFollow.followers
      }
    );
    
    currentUser.following.push(userIdToFollow);

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUserId,
      {
        followers: currentUser.following
      }
    );
    
    return updatedUserToFollow;
  } catch (error) {
    throw new Error;
  }
}

export async function RemoveFollowerOfUserById(currentUserId: string, userIdToUnFollow: string) {
  try {
    const userToFollow = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userIdToUnFollow
    );

    const currentUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUserId
    );

    if (!userToFollow || !currentUser) {
      throw Error;
    }

    userToFollow.followers.filter((item: string) => item !== currentUserId);

    const updatedUserToFollow = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userIdToUnFollow,
      {
        followers: userToFollow.followers
      }
    );
    
    currentUser.following.filter((item: string) => item !== userIdToUnFollow);

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUserId,
      {
        followers: currentUser.following
      }
    );
    
    return updatedUserToFollow;
  } catch (error) {
    throw new Error;
  }
}