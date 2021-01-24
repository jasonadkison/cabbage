import SupabaseClient from "@supabase/supabase-js/dist/main/SupabaseClient";
import {ErrorInfo, isErrorInfo} from "Error/ErrorUtil";
import {Columns, flyway_schema_history, Functions, private_user_info, public_user_info, store_error_params, Tables} from "Api/CabbageSchema";
import {parseSbQueryResult, parseSbVoidFunctionResult} from "Api/SupabaseUtil";

const log = console;

export async function loadDisplayName(db: SupabaseClient):
  Promise<string|ErrorInfo>{
  const result = await db.from<public_user_info>(Tables.public_user_info).
    select(Columns.public_user_info.display_name).
    eq("uuid", db.auth.user()?.id);

  const data = parseSbQueryResult<public_user_info>(result);
  if( isErrorInfo(data) ){
    return data;
  }

  return data?.[0]?.display_name ?? "";
}

export async function saveDisplayName(
  db: SupabaseClient, newValue: string
): Promise<string|ErrorInfo>{
  const result = await db.from<public_user_info>(Tables.public_user_info).
    insert({uuid: db.auth.user()?.id, display_name: newValue}, {upsert: true});

  log.debug("result of save", result);
  if( result.error ){
    if( result.status === 404 ){
      /* when I was having problems with bad RLS policicies, sometimes
       error was populated with an empty array - wtf? */
      return { problem: result, message: result.statusText};
    }
    return { problem: result.error, message: result.error.message};
  }
  if( result.data?.length !== 1 ){
    return { problem: result, message: "unexpected data returned from db"};
  }
  return result.data[0].display_name ?? "";
}

export async function saveContactDetails(
  db: SupabaseClient, newValue: string
): Promise<string|ErrorInfo>{
  const result = await db.from<private_user_info>(Tables.private_user_info).
    insert(
      { uuid: db.auth.user()?.id,
        contact_details: newValue },
      {upsert: true} );

  log.debug("result of save", result);
  if( result.error ){
    return { problem: result.error, message: result.error.message};
  }
  if( result.data?.length !== 1 ){
    return { problem: result, message: "unexpectec data returned from db"};
  }
  return result.data[0].contact_details ?? "";
}


export async function loadContactDetails(db: SupabaseClient):
  Promise<string|ErrorInfo>
{
  const result = await db.from<private_user_info>(Tables.private_user_info).
    select(Columns.private_user_info.contact_details);

  const data = parseSbQueryResult<private_user_info>(result);
  if( isErrorInfo(data) ){
    return data;
  }

  return data?.[0]?.contact_details ?? "";
}

export async function loadFlywaySchemaHistory(db: SupabaseClient):
  Promise<flyway_schema_history[]|ErrorInfo>
{
  const result = await db.from<flyway_schema_history>(Tables.flyway_schema_history).
    // note that "version" here is typed - a wrong column name will not compile
    select().order("version", {ascending: true});

  const data = parseSbQueryResult<flyway_schema_history>(result);
  if( isErrorInfo(data) ){
    return data;
  }

  return data;
}

/** @return undefined indicates a successful invocation **/
export async function store_error(db: SupabaseClient, params: store_error_params):
  Promise<ErrorInfo | undefined>
{
  const result = await db.rpc(Functions.store_error, params);

  return parseSbVoidFunctionResult(result);
}

