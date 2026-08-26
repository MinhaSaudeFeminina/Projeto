<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSupportContactRequest;
use App\Http\Requests\Admin\UpdateSupportContactRequest;
use App\Models\AdminRole;
use App\Models\SupportContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class SupportContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->hasAdminRole(AdminRole::ADMIN), HttpResponse::HTTP_FORBIDDEN);

        $contacts = SupportContact::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $contacts], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function store(StoreSupportContactRequest $request): JsonResponse
    {
        $contact = SupportContact::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $contact], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(UpdateSupportContactRequest $request, SupportContact $supportContact): JsonResponse
    {
        $supportContact->fill([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ])->save();

        return response()->json(['data' => $supportContact->refresh()], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function destroy(Request $request, SupportContact $supportContact): Response
    {
        abort_unless($request->user()?->hasAdminRole(AdminRole::ADMIN), HttpResponse::HTTP_FORBIDDEN);

        $supportContact->delete();

        return response()->noContent();
    }
}
